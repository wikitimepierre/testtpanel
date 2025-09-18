import React from 'react';
import * as PIXI from 'pixi.js';

export interface TimeBoxProps {
  obj: any;
  activeObjectId: number | null;
  onPointerDown: (event: any, obj: any) => void;
  isPanelLineDragging: boolean;
}

export function createTimeBox({ obj, activeObjectId, onPointerDown, isPanelLineDragging }: TimeBoxProps) {
  const container = new PIXI.Container();
  container.x = obj.x;
  container.y = obj.y;

  // Hover background (behind the box)
  const hoverBg = new PIXI.Graphics();
  hoverBg.clear();
  hoverBg.rect(-container.x, -4, obj.width, obj.height + 4);
  hoverBg.fill(0x0000FF); hoverBg.alpha = 0.2;
  hoverBg.visible = false;

  // Create box graphics
  const baseFill = obj.color === 'grey' ? 0xDDDDDD : 0xFFFF00;
  const strokeWidth = obj.id === activeObjectId ? 5 : 2;
  const box = new PIXI.Graphics();
  box.clear();
  box.rect(0, 0, obj.width, obj.height);
  box.fill(baseFill);
  box.stroke({ width: strokeWidth, color: 0x000000 });

  // Create text
  const text = new PIXI.Text({
    text: obj.text,
    style: { fontFamily: 'Arial', fontSize: 12, fill: 0x000000, align: 'center' }
  });
  text.x = (obj.width - text.width) / 2;
  text.y = (obj.height - text.height) / 2;

  container.addChild(hoverBg);
  container.addChild(box);
  container.addChild(text);

  container.eventMode = 'static';
  container.cursor = 'pointer';

  container.on('pointerenter', () => {
    if (!isPanelLineDragging) {
      hoverBg.visible = true;
      box.stroke({ width: 2, color: 0x0000FF });
    }
  });
  container.on('pointerleave', () => {
    if (!isPanelLineDragging) {
      hoverBg.visible = false;
    }
  });
  container.on('pointerdown', (event) => onPointerDown(event, obj));

  return container;
}
