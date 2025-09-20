/**
 * TimeBox Component Factory
 * 
 * Creates PIXI.js container elements representing individual timeline boxes.
 * Handles visual rendering, hover effects, and pointer interactions.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { BoxObject, PointerEventHandler, PANEL_CONFIG } from '../types';

export interface TimeBoxProps {
  obj: BoxObject | null;
  activeObjectId: number | null;
  onPointerDown: PointerEventHandler;
  isDragging: () => boolean;
}

/**
 * Creates a PIXI container representing a timeline box with hover and interaction support
 */

export function createTimeBox({ obj, activeObjectId, onPointerDown, isDragging }: TimeBoxProps) {
  const container = new Container();
  container.x = 0;
  container.y = obj ? obj.y : 0;

  // Panel line background (full width, behind the box)
  const panelLineWidth = PANEL_CONFIG.CANVAS_WIDTH;
  const panelLineHeight = obj ? obj.height + 4 : PANEL_CONFIG.LINE_HEIGHT + 4;
  const hoverBg = new Graphics();
  hoverBg.clear();
  hoverBg.rect(0, -2, panelLineWidth, panelLineHeight);
  hoverBg.fill(0x4A90E2); // More professional blue color
  hoverBg.alpha = 0.5; // Subtle transparency
  hoverBg.visible = false;
  // Mark this as the hover background for external control
  (hoverBg as any).isHoverBackground = true;

  container.addChild(hoverBg);

  // Selection background (darker than hover, shows when selected)
  const selectionBg = new Graphics();
  selectionBg.clear();
  selectionBg.rect(0, -2, panelLineWidth, panelLineHeight);
  selectionBg.fill(0x2C5AA0); // Darker blue for selection
  selectionBg.alpha = 1; // More prominent than hover
  selectionBg.visible = obj?.id === activeObjectId; // Show if selected
  // Mark this as the selection background
  (selectionBg as any).isSelectionBackground = true;

  container.addChild(selectionBg);

  // Only draw box and text if obj is present
  let box: Graphics | null = null;
  let text: Text | null = null;
  let strokeWidth = 1;
  if (obj) {
    const baseFill = obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00;
    strokeWidth = obj.id === activeObjectId ? 4 : 2; // Thicker border for selected
    box = new Graphics();
    box.clear();
    box.rect(obj.x, 0, obj.width, obj.height);
    box.fill(baseFill);
    box.stroke({ width: strokeWidth, color: 0x000000 });
    container.addChild(box);

    text = new Text({
      text: obj.text,
      style: { fontFamily: 'Arial', fontSize: 12, fill: 0x000000, align: 'center' }
    });
    text.x = obj.x + (obj.width - text.width) / 2;
    text.y = (obj.height - text.height) / 2;
    container.addChild(text);
  }

  container.eventMode = 'static';
  container.cursor = obj ? 'pointer' : 'default'; // Only show pointer cursor if there's an actual box

  // Hover logic for the entire line
  container.on('pointerenter', () => {
    if (!isDragging()) {
      // Only show hover background if not selected
      if (obj?.id !== activeObjectId) {
        hoverBg.visible = true;
      }
      // if (box) {
      //   // Enhance box border on hover
      //   const hoverBorderWidth = obj?.id === activeObjectId ? 5 : 3; // Thicker if selected
      //   box.stroke({ width: hoverBorderWidth, color: 0x4A90E2 });
      // }
    }
  });
  
  container.on('pointerleave', () => {
    if (!isDragging()) {
      hoverBg.visible = false;
      if (box) {
        // Restore original border
        const strokeWidth = obj?.id === activeObjectId ? 4 : 2; // Thicker border for selected
        box.stroke({ width: strokeWidth, color: 0x000000 });
      }
    }
  });
  container.on('pointerdown', (event: PointerEvent) => {
    if (obj) onPointerDown(event, obj);
  });

  return container;
}
