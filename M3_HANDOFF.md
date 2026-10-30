# M3 交接说明

M3 要求（`graphicproj-中文.md`）：Blinn-Phong 光照（ambient + diffuse + specular）、场景图 ≥3 实例 + 1 条父子链、≥1 个用户交互。

| 要求 | 状态 |
|---|---|
| 场景图 | 已完成 |
| Blinn-Phong 光照 | 未完成（插座已铺） |
| 用户交互 | 未完成（空壳已建） |

场景：M3 统一在 `loadRoomScene()` 上开发（`main.js` 已默认切换到该场景）。新增物体在 `src/scene/createRoomScene.js` 里用 `add(...)` 添加。

---

## ① 场景图（已完成）

**查看**：`src/scene/createRoomScene.js`。`Table` 为组节点（无几何），下挂 5 个子节点 `Base / Pillar / Tabletop / Board / Pawn`。

**验收**：运行项目，房间中央的棋盘桌即该子树。给 `Table` 临时加动画（如 `{ type: "spin", speed: 0.5 }`），整桌整体转动，证明子节点继承父变换。
可以添加其他的物体，改变纹理以及颜色

---

## ② Blinn-Phong 光照（未完成）

**目标**：片元着色器实现 ambient + diffuse + specular。

**最终效果**：场景出现光源，物体朝光面亮、背光面暗（diffuse），整体有一层均匀底光（ambient），光滑表面出现高光点（specular）。

**插座**：

| 文件 | 已就位 |
|---|---|
| `src/types.js` | `Light` 类型、`Scene.lights`、`SceneObject.specular / shininess` |
| `src/scenegraph/SceneGraph.js` | 每对象 `specular = null`、`shininess = 32` |
| `src/rendering/ShaderProgram.js` | `setVec3()`、`setFloat()` |
| `src/scene/createRoomScene.js` | `lights: []`（含注释示例灯） |
| `src/rendering/SceneRenderer.js` | 构造已接收 `scene`，`this.lights` / `this.background` 就位 |

**TODO**（供参考）

1. 新建 lit shader（`src/shaders/litTexture.js`、`litSolid.js`）。顶点着色器使用 `aNormal`（location 2，`IndexedMesh.js` 已配置）与法线矩阵 `transpose(inverse(mat3(uModel)))`；片元着色器计算 ambient + diffuse + specular。
2. `SceneRenderer.draw()` 增加 lit 分支，遍历 `this.lights`，用 `setVec3` / `setFloat` 上传位置/颜色/强度。
3. `createRoomScene.js` 的 `lights` 填灯。
4. 高光物体设 `obj.specular` / `obj.shininess`。

---

## ③ 用户交互（未完成）

**目标**：中心准星拾取 + 空格键抓取缩放。

**最终效果**：中心准星对准可拾取物体时高亮；按空格抓起物体并跟随视角移动，物体在屏幕上的大小保持固定（移远→实际变大、移近→实际变小）；再按空格释放，物体停在当前位置与新的实际大小。

**空壳**：

| 文件 | 已就位 |
|---|---|
| `src/interaction/raycaster.js` | `screenToRay` / `intersectSphere` / `pick` 签名 + TODO |
| `src/interaction/InteractionController.js` | 类 + `update()` + TODO |
| `src/types.js` / `src/scenegraph/SceneGraph.js` | `interactable`（false）、`bounds`（null） |
| `src/main.js` | 三处注释接线点 |
| `src/physics/CollisionWorld.js` | `// M3 (interaction)` 路标注释 |

**TODO**（供参考）

1. `raycaster.js`：实现 `screenToRay`、`intersectSphere`、`pick`（遍历场景找最近 `interactable` 命中）。
2. `CollisionWorld` 增加 `raycast()`（射线 vs 三角形），复用 `this.triangles`，返回「相机→物体」方向最近命中距离，跳过被拿起的物体自身。
3. `InteractionController.js`：状态机 `idle → hover → holding → idle`；空格选中时冻结 `animation` 并记录 `grabScale` / `grabDistance`；每帧写 `baseScale` / `basePosition`；释放时恢复 `animation`。
4. `main.js` 取消三处注释。
5. 可拾取物体设 `obj.interactable = true; obj.bounds = <半径>`。

---

## 约定

- 交互系统写 `baseScale` / `basePosition`，读 `interactable` / `bounds`，读写 `animation`；`local` / `world` 由 `updateWorld` 维护。
- 透视缩放公式：`s = s0 × (d / d0)`。
- 包围球半径 `r0 = max |vertex|`，每个几何预计算一次并缓存；世界半径 `R = r0 × scale`；非均匀缩放取 `max(sx, sy, sz)`。
- `bounds` 默认 `null`，M3 计算后填入。
- 灯光数据位于 `scene.lights`。

---

## 附：main.js 接线点

```js
// import { InteractionController } from "./interaction/InteractionController.js";
// const interaction = new InteractionController(camera, scene.root, mouse, world);
// interaction.update(deltaSeconds);
```

交互采用中心准星 + 空格键；若改用其他操控方案，调整 `InteractionController` 构造参数。
