const img = new Image();

const jitterImage = {
    loadUI(container) {
        if (this.element) return;

        this.element = document.createElement('input');
        this.element.type = 'file';
        this.element.accept = '.png';
        this.element.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;

            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.getElementById('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
            };
        });

        container.appendChild(this.element);
    },
    unloadUI() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    },
    draw(ctx, frequencyData) {
        const sum = frequencyData.reduce((a, b) => a + b, 0);
        const average = sum / frequencyData.length;
        const scale = 1 + average / 512;
        ctx.save();
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
    }
};

export { jitterImage };
