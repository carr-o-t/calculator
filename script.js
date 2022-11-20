let lastOperation = undefined;
let isHistory = false;
let counter = 0;
let lastComputation = {
  prevOperand: "",
  currentOperand: "",
  operation: undefined,
};
let historyList = [];

class Calculator {
  constructor(prevOperandTextElement, currOperandTextElement) {
    this.prevOperandTextElement = prevOperandTextElement;
    this.currOperandTextElement = currOperandTextElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "";
    this.prevOperand = "";
    this.operation = undefined;
  }

  delete() {
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (number === "." && this.currentOperand.includes(".")) {
      return;
    }
    if (lastOperation === "=" || (lastOperation === "=" && number === ".")) {
      this.currentOperand = "";
      lastOperation = undefined;
    }
    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  chooseOperation(operation) {
    if (this.currentOperand === "") return;
    if (this.currentOperand !== "") {
      this.compute();
    }
    this.operation = operation;
    this.prevOperand = this.currentOperand;
    this.currentOperand = "";
  }

  compute() {
    let computation;
    const prev = parseFloat(this.prevOperand);
    const curr = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(curr)) return;
    switch (this.operation) {
      case "+":
        computation = prev + curr;
        break;
      case "-":
        computation = prev - curr;
        break;
      case "x":
        computation = prev * curr;
        break;
      case "/":
        computation = prev / curr;
        break;
      case "^":
        computation = Math.pow(prev, curr);
        break;
      default:
        return;
    }
    
    if (JSON.parse(localStorage.getItem("historyCalc")) !== null) {
      historyList = JSON.parse(localStorage.getItem("historyCalc"));
      if (historyList.length + 1 > 3) {
        historyList.shift();
      }
      historyList.push({
        prevOperand: this.prevOperand,
        currentOperand: this.currentOperand,
        operation: this.operation,
      });
      localStorage.setItem("historyCalc", JSON.stringify(historyList));
      this.currentOperand = computation;
      this.operation = undefined;
      this.prevOperand = "";
    } else {
      historyList.push({
        prevOperand: this.prevOperand,
        currentOperand: this.currentOperand,
        operation: this.operation,
      });
      localStorage.setItem("historyCalc", JSON.stringify(historyList));
      this.currentOperand = computation;
      this.operation = undefined;
      this.prevOperand = "";
    }
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {
        maximumFractionDigits: 6,
      });
    }
    if (decimalDigits !== undefined) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }
  updateDisplay() {
    this.currOperandTextElement.innerText = this.getDisplayNumber(
      this.currentOperand
    );
    if (this.operation !== undefined) {
      this.prevOperandTextElement.innerText = `${this.getDisplayNumber(
        this.prevOperand
      )} ${this.operation}`;
    } else {
      this.prevOperandTextElement.innerText = "";
    }
  }
  setToHistory(calculation) {
    const op = calculation.toString().split(" ");
    this.prevOperand = op[0];
    this.currentOperand = op[2];
    this.operation = op[1];
  }
}

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const equalButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const clearButton = document.querySelector("[data-clear]");
const prevOperandTextElement = document.querySelector("[data-prev-operand]");
const currOperandTextElement = document.querySelector("[data-curr-operand]");
const historyBUtton = document.querySelector("[data-history]");
const ulList = document.querySelector("[data-ul]");
const listItems = document.querySelectorAll("[data-list-item]");

const calculator = new Calculator(
  prevOperandTextElement,
  currOperandTextElement
);

function handleHistory() {
  isHistory = !isHistory;
  numberButtons.forEach((button) => {
    button.classList.toggle("hide");
  });
  clearButton.classList.toggle("hide");
  deleteButton.classList.toggle("hide");
  equalButton.classList.toggle("hide");
  operationButtons.forEach((button) => {
    if (button.innerText === "^") {
      button.classList.toggle("translate-right");
    }
  });
  document.querySelector("[data-historyList]").classList.toggle("history-show");

  if (isHistory) {
    let localStorageList = JSON.parse(localStorage.getItem("historyCalc"));
    localStorageList.map((item) => {
      const node = document.createElement("li");
      node.setAttribute("id", "item" + ++counter);
      node.innerText = `${item.prevOperand} ${item.operation} ${item.currentOperand}`;
      ulList.appendChild(node);
      node.addEventListener("click", () => {
        calculator.setToHistory(node.innerText);
        calculator.updateDisplay();
      });
    });
  }
  if (!isHistory) {
    const elements = document.querySelectorAll("li");
    elements.forEach((element) => element.remove());
    counter = 0;
  }
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  });
});

equalButton.addEventListener("click", () => {
  lastOperation = "=";
  calculator.compute();
  calculator.updateDisplay();
});

clearButton.addEventListener("click", () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener("click", () => {
  calculator.delete();
  calculator.updateDisplay();
});

historyBUtton.addEventListener("click", () => {
  handleHistory();
});
