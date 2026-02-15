---
title: "Bézier Curves & Font Rendering Engine (C++)"
date: 2025-12-05
excerpt: "From quadratic Bézier curves to a complete C++ font rendering engine using De Casteljau, scanline filling, and SDL."
tags: [c++, computer-graphics, bezier, sdl2, rendering, computational-geometry]
thumbnail: "https://images.squarespace-cdn.com/content/526b2b0ee4b012bab8167868/1563109466261-RT3X27JBKS215VTWKMIH/BlogHeaderBlog-Header.png?format=1500w&content-type=image%2Fpng"
---

**ENSIIE – PAP Project (2025–2026)**  

**Authors:** SEK Sopheak Voatei, THONG Ousaphea  
**Supervisor:** Vincent Torri  

---

## Project Overview

TrueType fonts represent characters not as fixed pixel grids, but as **parametric geometric curves**.

Instead of storing one bitmap per size, each glyph is defined mathematically using Bézier curves.  
This allows:

- Smooth scaling  
- Resolution independence  
- Compact representation  
- Cleaner rendering  

In this project, we built a **C++ font rendering engine from scratch**, capable of:

- Representing glyphs using quadratic Bézier curves  
- Evaluating curves using the **De Casteljau algorithm**  
- Rasterizing outlines into a custom bitmap  
- Filling glyph interiors using a scanline algorithm  
- Displaying results with SDL2  

This project connects **mathematics, computational geometry, and low-level graphics programming**.

---

## Mathematical Foundations

### Linear Bézier Curve (Degree 1)

A linear Bézier curve between two control points $P_0$ and $P_1$ is:

$$
B(t) = (1 - t)P_0 + tP_1, \quad t \in [0,1]
$$

This corresponds to simple linear interpolation.

It forms the foundation of higher-degree Bézier constructions.

---

### Quadratic Bézier Curve (Degree 2)

A quadratic Bézier curve is defined by:

- Start point $P_0$
- Control point $C$
- End point $P_1$

$$
B(t) = (1 - t)^2 P_0 + 2t(1 - t)C + t^2 P_1
$$

The control point $C$ determines the curvature of the path.

Quadratic Bézier curves are widely used in TrueType fonts because they provide:

- Smooth shapes  
- Low computational cost  
- Compact geometric representation  

---

## De Casteljau Algorithm

Instead of evaluating the polynomial form directly, we implemented the **De Casteljau algorithm**, based on recursive interpolation.

For a quadratic curve:

$$
Q_0 = (1 - t)P_0 + tC
$$

$$
Q_1 = (1 - t)C + tP_1
$$

$$
B(t) = (1 - t)Q_0 + tQ_1
$$

### Why De Casteljau?

- Numerically stable  
- Avoids polynomial expansion  
- Naturally supports curve subdivision  
- Geometrically intuitive  

In practice, we sample multiple values of $t \in [0,1]$ to approximate the curve with line segments.

---

## Rendering Pipeline

Each glyph is represented as:

- A set of **closed contours**
- Each contour composed of quadratic Bézier segments

Rendering proceeds in four stages:

1. Curve discretization  
2. Polygonal approximation  
3. Contour rasterization  
4. Interior filling  

The discretization step introduces a trade-off:

- Smaller step → smoother curves  
- Larger step → faster rendering  

---

## Scanline Filling Algorithm

After drawing contours, we fill the interior using a **scanline algorithm**.

For each horizontal line:

1. Compute intersections with contour edges  
2. Sort intersection points  
3. Fill pixels between successive pairs  

This method:

- Is efficient  
- Works well for closed shapes  
- Correctly handles holes (A, B, O, P, Q, R)  

---

## Red Border Enhancement

To improve readability, we added a **2-pixel red border**:

- For each contour pixel  
- Duplicate color to neighboring pixels  

This simple post-processing step enhances contrast and glyph clarity.

---

## Software Architecture

The system follows a modular layered architecture:

```txt
main
 ├── render
 │    ├── glyph
 │    │     ├── bezier
 │    │     │     └── math2d
 │    ├── bitmap
 └── sdlwrap
```

### Design Principles

- Low-level math isolated in `Math2D`
- Geometry handled in `Bezier`
- Glyph structure independent from rendering
- `Renderer` handles rasterization
- SDL used only for display

This separation improves:

- Maintainability  
- Debugging  
- Code clarity  

---

## Core Classes

### `Bezier`

```cpp
Vec2 Bezier::evaluate(double t) const {
    Vec2 q0 = (1 - t) * p0 + t * c;
    Vec2 q1 = (1 - t) * c + t * p1;
    return (1 - t) * q0 + t * q1;
}
```

Responsible for evaluating and subdividing curves.

---

### `Bitmap`

```cpp
void Bitmap::setPixel(int x, int y, Color c) {
    m_pixels[y * m_w + x] = pack(c);
}
```

Manages the raw pixel buffer and color packing.

---

### `Renderer`

- Discretizes curves  
- Draws contour segments  
- Applies scanline filling  

Acts as the bridge between geometry and raster image.

---

## Results

The engine renders uppercase letters A–Z in three different modes.

### 1. Outline Only

![Outline Rendering](/images/projects/outline.jpg)

This mode displays only the discretized Bézier contours.  
It helps visualize the geometric structure of each glyph.

---

### 2. Filled Glyphs

![Filled Rendering](/images/projects/filled.jpg)

After rasterizing the contours, the interior is filled using the scanline algorithm.  
This produces solid, clean letter shapes.

---

### 3. Filled with Red Border

![Red Border Rendering](/images/projects/filled_red.jpg)

A 2-pixel red contour is added as post-processing.  
This enhances contrast and improves readability, especially for small glyph sizes.

---

The output demonstrates:

- Accurate curve evaluation  
- Correct interior filling  
- Proper handling of internal holes  
- Clean visual separation between glyph and background   

---

## Technical Insights

### Numerical Stability

Using De Casteljau avoids instability from direct polynomial evaluation.

### Sampling Resolution

Curve smoothness strongly depends on discretization granularity.

### Clean Architecture

Separating geometry from SDL rendering simplified debugging and testing.

---

## Limitations

- Only uppercase letters implemented  
- No cubic Bézier curves  
- No anti-aliasing  
- Glyphs hardcoded (no font file parsing)  

---

## Conclusion

This project allowed us to:

- Connect mathematical theory with practical rendering  
- Implement Bézier curves from first principles  
- Design a modular C++ rendering system  
- Apply computational geometry to typography  

It represents a complete mini rendering engine — from mathematical definition to real-time visual output.

---

## Technologies Used

- C++  
- SDL2  
- Computational Geometry  
- Raster Graphics Algorithms  
- Object-Oriented Design