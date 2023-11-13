const calculator = require('../helpers/calculator.js')

test('adding two numbers', () => {
    expect(calculator.sum(3,4)).toBe(7);
});

test('subtracting two numbers', () => {
    expect(calculator.subtract(3,4)).toBe(-1);
});

test('multiplying two numbers', () =>{
    expect(calculator.multiply(2,3)).toBe(6);
})

test('dividing two numbers', () =>{
    expect(calculator.divide(6,3)).toBe(2);
})