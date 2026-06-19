// Tiny shared store so the R3F render loop can read page-scroll progress
// without coupling the 3D scene to the HTML document height.
export const scrollState = {
  progress: 0, // 0 at top of page → 1 at the bottom
};
