COMP4422 PerspectiveLab - Geometry and Camera (M1)

A raw WebGL2 scene with a procedural sphere, an OBJ pyramid, and an OBJ cube.
The project uses its own Vec3/Mat4 library, indexed drawing, perspective MVP
transforms, depth testing, and a controllable camera with triangle collision.
The objects are static; requestAnimationFrame continuously redraws the scene.

RUN
Open this folder in VS Code and serve index.html with Live Preview.
Alternatively, from this folder run:
    python -m http.server 3000 --bind 127.0.0.1
Then open http://127.0.0.1:3000/index.html in a browser with WebGL2 support.
Use an HTTP server: opening index.html through file:// will not load the OBJ files.
No package installation or build step is required.

CONTROLS
Click the scene to focus it.
W/S: move forward/backward along the view direction.
A/D: move sideways.
Q/E: move down/up along world Y.
Shift: move faster.
Left-button drag or arrow keys: turn the camera.
Refresh the page to return to the initial view.

SOURCE
src/main.js                 Initialization, window resizing, and the frame loop.
src/math/                   Vec3, Vec4, and Mat4.
src/camera/                 Perspective camera and free-flight controller.
src/input/                  Keyboard state and mouse drag input.
src/geometry/sphere.js      Indexed unit sphere generated in JavaScript.
src/loaders/OBJLoader.js    OBJ text parsing and HTTP loading.
src/scene/                  Object transforms and initial camera pose.
src/rendering/              WebGL2 context, shader programs, buffers, and drawing.
src/shaders/solidColor.js   Face-normal coloring from fragment derivatives.
src/physics/                Upright cylinder collision against world triangles.
assets/models/             Original box and pyramid OBJ meshes.

CONVENTIONS AND SCOPE
Matrices use column-major storage and column vectors: clip = P * V * M * point.
The world is right-handed with Y up. View space looks down -Z; NDC depth is [-1, 1].
The canvas follows the browser window, leaving space for the controls below.
Drawing buffer dimensions use CSS pixels without an additional device-pixel ratio.

The OBJ loader accepts three-component positions, triangular faces, positive
indices, and relative negative indices. Face forms v, v/vt, v//vn, and v/vt/vn
are accepted, but only position indices are used. UVs, stored normals, materials,
and groups are skipped. Export triangulated meshes with at most 65535 positions.

The camera uses a fixed upright cylinder and checks every world-space triangle.
Movement is split into short axis sweeps with basic sliding. There is no gravity,
jumping, automatic slope climbing, or recovery from starting inside an obstacle.
Call CollisionWorld.rebuild() after changing a model matrix or mesh geometry.
This version covers geometry and camera work; gameplay, texturing, and lighting
are outside its current scope.

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
