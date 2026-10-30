COMP4422 PerspectiveLab - WebGL2 Scene (M1 + M2 complete, M3 pending)

A raw WebGL2 renderer (no Three.js) with a scene graph, procedural and image
textures with tinting, four animation types, a free-flight camera with triangle
collision, and stubbed interaction for M3. M1 (geometry/camera/collision) and M2
(shaders/textures/tinting/animation/scene graph) are complete; M3 (Blinn-Phong
lighting and pick-and-scale interaction) is not yet implemented. See M3_HANDOFF.md.

RUN
Open this folder in VS Code and serve index.html with Live Preview.
Alternatively, from this folder run:
    python -m http.server 3000 --bind 127.0.0.1
Then open http://127.0.0.1:3000/index.html in a browser with WebGL2 support.
Use an HTTP server: opening index.html through file:// will not load the assets.
No package installation or build step is required.

CONTROLS
Click the scene to focus it.
W/S: move forward/backward along the view direction.
A/D: move sideways.
Q/E: move down/up along world Y.
Shift: move faster.
Left-button drag or arrow keys: turn the camera.
Refresh the page to return to the initial view.

SCENES
Pick the scene in src/main.js by choosing which loader to await:
  loadCollisionScene()   M1 demo: a sphere, a pyramid, and a cube for camera + collision.
  loadM2DemoScene()      M2 default: material/animation showcase on a vertical grid.
  loadRoomScene()        M2 room: a chess table built from a five-child hierarchy.

SOURCE
src/main.js                 Initialization, window resizing, and the frame loop.
src/types.js                Shared type contracts (JSDoc typedefs, no runtime values).
src/math/                   Vec3, Vec4, and Mat4 (column-major).
src/scenegraph/             Scene graph: nodes, hierarchy, world matrices, and animation.
src/scene/                  Scene content built on top of scenegraph (the three scenes).
src/camera/                 Perspective camera and free-flight controller.
src/input/                  Keyboard state and mouse drag input.
src/geometry/               Procedural unit sphere and box (positions, UVs, normals).
src/loaders/                OBJ text parsing and image-texture loading.
src/rendering/              WebGL2 context, shader programs, meshes, textures, drawing.
src/shaders/                flatColor (tint), solidColor (face normals), texture (tint + sample).
src/physics/                Upright cylinder collision against world triangles.
src/interaction/            M3 stubs: ray casting and a pick-and-scale controller.
src/util/                   Small helpers (hexToRgb).
assets/models/              OBJ meshes.
assets/textures/            Image textures (fabric, marble, metal, wood).

CONVENTIONS AND SCOPE
Matrices use column-major storage and column vectors: clip = P * V * M * point.
The world is right-handed with Y up. View space looks down -Z; NDC depth is [-1, 1].
The canvas follows the browser window, leaving space for the controls below.
Drawing buffer dimensions use CSS pixels without an additional device-pixel ratio.

The scene graph stores a local transform per node (base position/yaw/scale plus
an optional animation) and derives world matrices top-down each frame: world =
parentWorld * local. Group nodes carry no geometry and only organize children.
Each node applies only its own animation; children follow an animated parent's
transform but do not inherit its animation spec. Animation types are spin, bob,
float, and pulse (src/scenegraph/animation.js).

Materials are checker and brick (procedural) and fabric, marble, metal, and wood
(image textures). A flat color tints a texture; a solid mesh is shaded from its
per-face normals. Normals are uploaded for OBJ meshes that define them and for
procedural geometry, so M3 lighting can reuse the existing vertex attributes.

The OBJ loader accepts three-component positions, texture coordinates, normals,
and triangular faces. Face forms v, v/vt, v//vn, and v/vt/vn are accepted, with
positive and relative-negative indices. UVs and normals are returned only when
the file defines them; materials and groups are skipped. Export triangulated
meshes with at most 65535 vertices.

The camera uses a fixed upright cylinder and checks every world-space triangle.
Movement is split into short axis sweeps with basic sliding. There is no gravity,
jumping, automatic slope climbing, or recovery from starting inside an obstacle.
Call CollisionWorld.rebuild() after changing a model matrix or mesh geometry.

M3 work is scoped and located in M3_HANDOFF.md: Blinn-Phong lighting (sockets in
src/types.js, src/scenegraph/SceneGraph.js, src/rendering/SceneRenderer.js) and
pick-and-scale interaction (stubs in src/interaction/).

REFERENCES AND ASSISTANCE
Course project brief:
https://canvas.polyu.edu.hk/courses/4427/modules/items/114581

Cylinder-triangle intersection algorithm reference:
https://www.geometrictools.com/Documentation/IntersectionTriangleCylinder.pdf
The collision code was written with ChatGPT/Codex assistance, following the
reference above, without a physics library.

The OBJ meshes were created by the team; the procedural sphere was generated
with AI assistance.
ChatGPT/Codex assisted with:
- architecture discussions and explanations;
- keyboard and mouse event listeners in src/input/ (the camera logic that uses
  this input was written by the team);
- the procedural sphere (src/geometry/sphere.js);
- placeholder shaders (src/shaders/solidColor.js);
- the collision implementation (src/physics/);
- refactoring, validation, and documentation.
