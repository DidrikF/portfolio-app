import { BaseModule } from './BaseModule';

export class DisplaySize extends BaseModule {
    onCreate = () => {
        // Create the container to hold the size display
        this.display = document.createElement('div');

        // Apply styles
        Object.assign(this.display.style, this.options.displayStyles);

        // Attach it
        this.overlay.appendChild(this.display);
    };

    onDestroy = () => {};

    onUpdate = () => {
        if (!this.display || !this.img) {
            return;
        }

        const size = this.getCurrentSize();
        this.display.innerHTML = size.join(' &times; ');
        if (this.img.style.float == 'right') {
			// position off bottom left
            const dispRect = this.display.getBoundingClientRect();
            Object.assign(this.display.style, {
                right: 'auto',
                bottom: `-${dispRect.height + 4}px`,
                left: `-${dispRect.width + 4}px`,
            });
        }
        else {
            // position off bottom right
            const dispRect = this.display.getBoundingClientRect();
            Object.assign(this.display.style, {
                right: `-${dispRect.width + 4}px`,
                bottom: `-${dispRect.height + 4}px`,
                left: 'auto',
            });
        }
    };

    getCurrentSize = () => {
        let width = this.img.style.width ? parseInt(this.img.style.width) + "%" : this.img.width + "px"
        let height = this.img.style.height ? 
            this.img.style.height :
            Math.round((this.img.width / this.img.naturalWidth) * this.img.naturalHeight) + "px"

        return [
            width,
            height,
        ];

    }
}