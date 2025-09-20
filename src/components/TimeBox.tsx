/**
 * TimeBox Component Factory
 * 
 * Creates PIXI.js container elements representing individual timeline boxes.
 * Handles visual rendering, hover effects, and pointer interactions.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { BoxObject, PointerEventHandler } from '../types';

export interface TimeBoxProps {
  obj: BoxObject | null;
  activeObjectId: number | null;
  onPointerDown: PointerEventHandler;
  isPanelLineDragging: boolean;
}

/**
 * Creates a PIXI container representing a timeline box with hover and interaction support
 */

export function createTimeBox({ obj, activeObjectId, onPointerDown, isPanelLineDragging }: TimeBoxProps) {
  const container = new Container();
  container.x = 0;
  container.y = obj ? obj.y : 0;

  // Panel line background (full width, behind the box)
  const panelLineWidth = 550;
  const panelLineHeight = obj ? obj.height + 4 : 34; // Default height if no box
  const hoverBg = new Graphics();
  hoverBg.clear();
  hoverBg.rect(0, -4, panelLineWidth, panelLineHeight);
  hoverBg.fill(0x0000FF); hoverBg.alpha = 0.2;
  hoverBg.visible = false;

  container.addChild(hoverBg);

  // Only draw box and text if obj is present
  let box: Graphics | null = null;
  let text: Text | null = null;
  let strokeWidth = 2;
  if (obj) {
    const baseFill = obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00;
    strokeWidth = obj.id === activeObjectId ? 5 : 2;
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
  container.cursor = 'pointer';

  // Hover logic for the entire line
  container.on('pointerenter', () => {
    if (!isPanelLineDragging) {
      hoverBg.visible = true;
      if (box) box.stroke({ width: 2, color: 0x0000FF });
    }
  });
  container.on('pointerleave', () => {
    if (!isPanelLineDragging) {
      hoverBg.visible = false;
      if (box) box.stroke({ width: strokeWidth, color: 0x000000 });
    }
  });
  container.on('pointerdown', (event: PointerEvent) => {
    if (obj) onPointerDown(event, obj);
  });

  return container;
}
