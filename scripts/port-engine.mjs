// Reproducible AS3 port; intentionally retains upstream arithmetic quirks.
import { transformSync } from "@babel/core";
import stripTypes from "@babel/plugin-transform-typescript";
import fs from "node:fs";
const names = [
  "NES",
  "BarcodeData",
  "FightingData",
  "BarcodeWorld",
  "BarcodeRead",
  "CreateFightingData",
  "FightingCalc",
  "C1WorldData",
  "C2PassCode",
];
for (const name of names) {
  let source = fs
    .readFileSync(`vendor/reference/${name}.as`, "utf8")
    .replace(/import\s+[\w.]+\s*;/g, "");
  source = source.slice(source.indexOf("public class")).replace(/}\s*$/, "");
  if (name === "C1WorldData")
    source =
      source.slice(
        0,
        source.indexOf("public  function createCloneInstanceInt"),
      ) + "clone(source: any) { return structuredClone(source); }\n}";
  source = source
    .replace(/public\s+class/g, "export class")
    .replace(/(?:public|private|protected)\s+function\s+/g, "")
    .replace(/(?:public|private|protected)\s+var\s+/g, "");
  source = source.replace(
    new RegExp(`\\b${name}\\(\\)\\s*\\{`),
    "constructor() {",
  );
  source = source.replace(
    /for each\s*\(var\s+(\w+)\s*:\s*\w+\s+in\s+([^)]*)\)/g,
    "for (var $1 of $2)",
  );
  source = source
    .replace(/:\s*int\b/g, ": number")
    .replace(/:\s*Boolean\b/g, ": boolean")
    .replace(/:\s*String\b/g, ": string")
    .replace(/:\s*(?:Object|Array|TextInput)\b/g, ": any");
  const port = ({ types: t }) => ({
    visitor: {
      Class(path) {
        const members = new Set(
          path.node.body.body
            .filter((x) => x.key?.type === "Identifier")
            .map((x) => x.key.name),
        );
        path.traverse({
          ClassMethod(p) {
            const coerce = [];
            for (const param of p.node.params) {
              if (
                t.isIdentifier(param) &&
                param.typeAnnotation?.typeAnnotation?.type === "TSNumberKeyword"
              )
                coerce.push(
                  t.expressionStatement(
                    t.assignmentExpression(
                      "=",
                      t.identifier(param.name),
                      t.callExpression(t.identifier("asInt"), [
                        t.identifier(param.name),
                      ]),
                    ),
                  ),
                );
            }
            p.node.body.body.unshift(...coerce);
          },
          ClassProperty(p) {
            if (!p.node.value) {
              const type = p.node.typeAnnotation?.typeAnnotation?.type;
              p.node.value =
                type === "TSNumberKeyword"
                  ? t.numericLiteral(0)
                  : type === "TSBooleanKeyword"
                    ? t.booleanLiteral(false)
                    : t.nullLiteral();
            }
          },
          Identifier(p) {
            if (p.node.name === "int" && p.isReferencedIdentifier()) {
              p.replaceWith(t.identifier("asInt"));
              return;
            }
            if (
              members.has(p.node.name) &&
              (p.isReferencedIdentifier() ||
                (p.parent.type === "AssignmentExpression" &&
                  p.parent.left === p.node) ||
                p.parent.type === "UpdateExpression") &&
              !p.scope.hasBinding(p.node.name)
            )
              p.replaceWith(
                t.memberExpression(
                  t.thisExpression(),
                  t.identifier(p.node.name),
                ),
              );
          },
          VariableDeclarator(p) {
            if (
              p.node.id.typeAnnotation?.typeAnnotation?.type ===
                "TSNumberKeyword" &&
              p.node.init
            ) {
              p.node.init = t.callExpression(t.identifier("asInt"), [
                p.node.init,
              ]);
            }
          },
          AssignmentExpression(p) {
            if (!t.isIdentifier(p.node.left) || p.node.operator !== "=") return;
            const binding = p.scope.getBinding(p.node.left.name);
            if (
              binding?.identifier.typeAnnotation?.typeAnnotation?.type ===
                "TSNumberKeyword" &&
              !p.node.extra?.ported
            ) {
              p.node.right = t.callExpression(t.identifier("asInt"), [
                p.node.right,
              ]);
              p.node.extra = { ported: true };
            }
          },
          ReturnStatement(p) {
            const fn = p.getFunctionParent();
            if (
              fn?.node.returnType?.typeAnnotation?.type === "TSNumberKeyword" &&
              p.node.argument &&
              !p.node.extra?.ported
            ) {
              p.node.argument = t.callExpression(t.identifier("asInt"), [
                p.node.argument,
              ]);
              p.node.extra = { ported: true };
            }
          },
        });
      },
    },
  });
  const first = transformSync(source, {
    filename: name + ".ts",
    configFile: false,
    parserOpts: { plugins: ["typescript"] },
    plugins: [port],
  });
  const js = transformSync(first.code, {
    filename: name + ".ts",
    configFile: false,
    plugins: [[stripTypes, { allowDeclareFields: true }]],
  }).code;
  let output = js;
  if (["BarcodeRead", "FightingCalc", "C1WorldData"].includes(name))
    output = js
      .replace(/Math\.random\(\)/g, "this.random()")
      .replace(
        "export class " + name + " {",
        "export class " + name + " {\n  random = Math.random;",
      );
  const deps = names.filter(
    (n) => n !== name && new RegExp("\\b" + n + "\\b").test(js),
  );
  fs.writeFileSync(
    `src/engine/${name}.js`,
    `// Generated from finalfighter/BarcodeBattler2-Simulator @ 3211674. See vendor/reference.\nimport { asInt } from './runtime.js';\n${deps.map((n) => `import { ${n} } from './${n}.js';`).join("\n")}\n${output.replace(/[ \t]+$/gm, "")}\n`,
  );
}
