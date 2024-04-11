let color = 'red';
const spectrogram = {
    loadUI: function(container) {
        if (this.element) return;
        this.element = document.createElement('input');
        this.element.type = 'color';
        this.element.value = '#FF0000';
        this.element.addEventListener('input', function() {
          color = this.value;
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
        const barWidth = (ctx.canvas.width / frequencyData.length) * 2.5;
        frequencyData.forEach((value, index) => {
          const barHeight = value / 2;
          ctx.fillStyle = color;
          ctx.fillRect(index * (barWidth + 1), ctx.canvas.height - barHeight / 2, barWidth, barHeight / 2);
        });
    }
  };
  
  export { spectrogram };
  