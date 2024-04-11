let img = new Image();
const jitterImage = {    
    loadUI: function(container) {
        if (this.element) return;  // Prevent duplicate elements if already added

        this.element = document.createElement('input');
        this.element.type = 'file';
        this.element.accept = '.png';
        this.element.addEventListener('change', function(event) {
            const file = this.files[0];
            img.src = URL.createObjectURL(file);
            img.onload = () => {
              const canvas = document.getElementById('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
            };
        });
    
        container.appendChild(this.element);
    },
    unloadUI: function() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;  // Clear the reference
        }
    },
    draw: function(ctx, frequencyData) {
        let sum = frequencyData.reduce((a, b) => a + b, 0);
        let average = sum / frequencyData.length;
        let scale = 1 + average / 512;
        ctx.save();
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
    }
  };
  
export { jitterImage };


