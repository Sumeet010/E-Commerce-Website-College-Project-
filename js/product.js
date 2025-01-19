class ProductQuantity {
    constructor(inputId) {
        this.input = document.getElementById(inputId);
        if (!this.input) {
            console.error(`Input element with id ${inputId} not found`);
            return;
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.btn-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent === '+' ? 'increase' : 'decrease';
                this[action]();
            });
        });

        this.input.addEventListener('change', () => this.validateInput());
    }

    increase() {
        const currentValue = this.getCurrentValue();
        this.input.value = currentValue + 1;
    }

    decrease() {
        const currentValue = this.getCurrentValue();
        this.input.value = Math.max(1, currentValue - 1);
    }

    getCurrentValue() {
        return parseInt(this.input.value) || 1;
    }

    validateInput() {
        let value = this.getCurrentValue();
        if (value < 1) value = 1;
        this.input.value = value;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductQuantity('quantity');
}); 