# Lumen Trace

A Windows desktop research tool for deterministic agent-based modeling,
multi-target coordination, editable simulation boundaries, and pheromone fields.

## Current interaction model

- The app opens on a cinematic research dashboard with live system metrics,
  current-study statistics, recent simulation history, and a switchable hero field.
- Use `ENTER WORKSPACE`, `NEW SCENARIO`, `OPEN`, or `LOAD RECENT` to move from
  the dashboard into the simulation environment.
- Dashboard launch actions use a fixed two-row layout so labels and button
  shapes remain fully visible without colliding with the lower research cards.
- Use the top `SCENARIOS`, `SIMULATIONS`, `ANALYSIS`, `FAB LAB`, and `SETTINGS` navigation
  to open the matching workspace section. The six research-toolkit tiles route
  directly to agents, fields, boundaries, trails, analysis, and exports.
- Recent-run actions remain disabled until a valid saved scenario exists,
  preventing empty reopen, replay, duplicate, compare, and export operations.
- Maximizing the window scales the complete launch composition proportionally,
  preserving its typography, card hierarchy, hero field, and spacing.
- Reopen, replay, duplicate, compare, or export the latest saved scenario from
  the launch dashboard. Recent-project history persists across launches.
- Use `CHANGE HERO` to select last-simulation replay, generated agents,
  pheromone flow, boundary preview, builder paths, or an imported image.
- Use the left `Interface & view` panel for appearance, hero, layers, trails,
  role colours, and system-monitor presentation.
- Use the right `Simulation setup` panel for grouped simulation functions.
  The function map jumps to setup/canvas, agents/motion, pheromone fields,
  fabrication/Brep deposition, space/boundary, and visual/trail controls.
- Left-click empty viewport space to place a target.
- Drag targets to reposition them; right-click removes them.
- Select a target and use `TARGET SIZE` to change its influence radius.
- Draw rectangle, circle, or polygon boundaries from the editing toolbar.
- Drag an entire boundary with `Move boundary`; agents are re-contained live.
- Edit boundary vertices or radius handles with the boundary editing tool.
- Create, duplicate, rename, lock, hide, resize, and drag multiple agent start points.
- Assign start-specific counts, role weights, spawn radii, initial direction, speed, and seed offsets.
- Zoom around the cursor with the mouse wheel and pan with middle-drag.
- Configure trails by color, role, speed, pheromone strength, or trail age.
- Agent paths are drawn as continuous trajectories using every available engine
  movement sample, and remain on the field until the simulation is explicitly restarted
  or a new loop cycle begins.
- Use `LOOP AT TARGET` to choose whether a running simulation restarts the same
  scenario when every active agent reaches a target. The selected behavior persists
  across launches.
- When target looping is disabled, converged agents continue moving and extending
  their trails; the global iteration limit still wraps into a fresh cycle instead
  of stopping playback.
- Simulation updates use reusable engine buffers, batched presentation, compact
  metric samples, adaptive frame pacing, deterministic hardware-aware worker
  planning, and long-trail simplification to remain responsive across a wider
  range of Windows hardware.
- Monitor CPU, GPU, RAM, FPS, tick rate, agent load, trails, and pheromone cells.
- Inspect adaptive agent/field worker counts in the expanded performance monitor;
  performance CSV exports retain the mode and worker counts for reproducibility.
- Expand, pin, reset, time-window, hide, or export the live performance monitor.
- Enable persistent `PERFORMANCE MODE` from Appearance or System Usage to lower
  decorative particle density, heatmap detail, trail glow, dense-agent detail,
  and presentation frequency without changing deterministic simulation logic.
- Project saves use same-directory atomic replacement and preserve the previous
  valid project as a `.bak` recovery file.
- Project loading validates schema, file size, numeric values, grid memory,
  targets, boundaries, and start points before creating simulation state.
- Replace the project hero image with the `IMAGE` control.
- Switch the interactive hero field between the last simulation and seven
  procedural modes. Cursor movement bends nearby paths and creates a visible
  velocity-driven wake inside the dashboard hero.
- `SWARM TRAILS` uses the original freely moving agents and retained continuous
  trajectories. Cursor position and velocity attract nearby agents, create a
  local tangent wake, and expose an influence ring; clicking adds an outward impulse.
- Hero particles and trails inherit the current UI accent and appearance mode.
- Entering any workspace section pauses the research run, both dashboard
  animation layers, and the workspace hero preview; recent-run replay now
  opens ready but paused.
- Change the global interface accent with the themed `ACCENT` palette;
  curated swatches, custom hex input, live preview, cancel/restore, and
  persistent Apply behavior are built into the interface.
- Switch between `DARK`, `LIGHT`, and `SYSTEM` appearance modes from the
  model inspector. System mode follows the Windows app theme automatically,
  while explicit modes and the selected accent persist across launches.
- Appearance changes update the complete interface and research field,
  including panels, controls, scrollbars, typography, grid lines, overlays,
  boundaries, pheromone visibility, targets, agents, and trail contrast.
- Use reduced motion or Calm, Normal, and Quick transition speeds; preferences persist.
- Hover any button or menu command for a concise explanation of its function.
- Apply simulation parameters with `APPLY / RESTART`; visualization settings update live.

## Fabrication and deposition architecture

- Fabrication Lab phase 1 provides strongly typed simulation interchange,
  fabrication intent, toolpath command, printer profile, G-code section,
  validation issue, job, export, and scoring models.
- Full G-code export readiness is blocked unless imported start/end templates
  exist and the extracted printer profile is explicitly approved by the user.
- Brep deposition phase 1 provides disabled-by-default Builder-only settings,
  preset/custom geometry definitions, lightweight placement instances, scenario
  state, and boundary/overlap/frame validation without adding simulation cost
  while deposition is disabled.
- The main simulation workspace now includes a functional Brep Deposition System.
  When enabled, eligible agents create deterministic lightweight geometry
  instances from newly presented trail movement; old trail history is not
  reprocessed and the configured placement cap is enforced.
- Choose seven 2D presets or nine 3D presets, filter Scout/Builder/Repairer/
  Fabricator roles, and control mode, spacing, density, scale, rotation,
  vertical offset, overlap, boundary validation, and preview visibility.
- Custom 3DM, OBJ, STL, GLB, glTF, DXF, and SVG files pass through a bounded,
  non-executing inspection workflow before their normalized preview can become
  active deposition geometry.
- Deposited geometry renders in the existing 2D field and in an independent 3D
  inspection view with orbit, pan, zoom, perspective/orthographic projection,
  fit and standard camera views, grid, axes, frames, and invalid-placement cues.
- Brep deposition geometry supports composable shading layers, so role,
  origin, pheromone, solid, wireframe, transparent, and ghosted preview modes
  can be combined instead of choosing one exclusive material mode.
- Deposition settings and placement results round-trip with scenario files.
  Placement data can also be exported asynchronously as JSON or CSV.
- Fabrication Lab phase 2 adds a first-class top-level route with responsive
  input, simulator, validation, printer-profile, status, and timeline regions.
- The shell reads the current engine snapshot and selected fabrication recipe,
  then reports real blocking validation messages and a printability score.
- Mapping-graph editing, profile import, toolpath playback, generation, and
  export remain visibly disabled until their implementation and safety gates
  are complete; the interface does not simulate successful fabrication work.
- Entering Fabrication Lab suspends every decorative simulation layer. Returning
  to the simulation workspace leaves the research run paused.

## Build

This workspace publishes to one stable latest Windows executable:

```powershell
.\publish-latest.ps1
```

The launchable app is always refreshed at:

```text
..\..\outputs\Lumen-Trace-V1-latest-win-x64\LumenTrace.exe
```

To publish the latest executable and launch it:

```powershell
.\run-app.ps1
```

For development and verification:

```powershell
.\publish-latest.ps1 -NoZip
dotnet build Stigmergy.slnx
dotnet test Stigmergy.slnx
```

The current implementation is Version 1. Project decisions and the next
session entry point are maintained in `docs/PROJECT_STATUS.md`. The execution
planner and its deterministic configuration surface are documented in
`docs/PERFORMANCE_FRAMEWORK.md`.
