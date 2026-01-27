---
name: Angular Component Generator
description: Scaffold a standalone Angular component with best practices (SCSS, typed inputs).
dependencies: "@angular/core, @angular/common"
---

## Guidelines
- Follow the Angular Style Guide.
- Use standalone components.
- Use typed inputs and outputs.
- Implement OnPush change detection.

## Template
\`\`\`typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="card" [class.highlighted]="isHighlighted">
      <header>
        <h2>{{ title }}</h2>
      </header>
      <div class="content">
        <ng-content></ng-content>
      </div>
      <footer>
        <button (click)="onAction.emit()">Action</button>
      </footer>
    </div>
  \`,
  styles: [\`
    .card { border: 1px solid #ccc; padding: 1rem; border-radius: 4px; }
    .highlighted { border-color: blue; }
  \`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomCardComponent {
  @Input({ required: true }) title!: string;
  @Input() isHighlighted = false;
  @Output() onAction = new EventEmitter<void>();
}
\`\`\`
