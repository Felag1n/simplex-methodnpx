"use client";

import { useState } from "react";

const SimplexSolver = () => {
  const [objectiveFunction, setObjectiveFunction] = useState("");
  const [constraints, setConstraints] = useState("");
  const [optimizationType, setOptimizationType] = useState("max");
  const [result, setResult] = useState(null);

  // Преобразование задачи к канонической форме
  const createSimplexTable = (objectiveFunction, constraints) => {
    let table = [];
    constraints.forEach((constraint, index) => {
      let row = [...constraint.coefficients];

      // Вводим дополнительные переменные (различные для <= и >=)
      if (constraint.sign === "<=") {
        row = row.concat(Array(constraints.length).fill(0));
        row[index + objectiveFunction.length] = 1;
      } else if (constraint.sign === ">=") {
        row = row.concat(Array(constraints.length).fill(0));
        row[index + objectiveFunction.length] = -1;
      }

      row.push(constraint.value); // правая часть
      table.push(row);
    });

    // Строка для функции цели
    let objectiveRow = objectiveFunction.concat(Array(constraints.length).fill(0));
    objectiveRow.push(0);  // правая часть
    table.push(objectiveRow);

    return table;
  };

 
  const solveSimplex = (table) => {
    while (!isOptimal(table)) {
      let pivotCol = findPivotColumn(table);
      let pivotRow = findPivotRow(table, pivotCol);
      performPivoting(table, pivotRow, pivotCol);
    }

    return extractSolution(table);
  };


  const isOptimal = (table) => {
    const lastRow = table[table.length - 1];
    if (optimizationType === "max") {
      return lastRow.every(val => val >= 0);  // для максимизации все коэффициенты должны быть >= 0
    } else {
      return lastRow.every(val => val <= 0);  // для минимизации все коэффициенты должны быть <= 0
    }
  };


  const findPivotColumn = (table) => {
    const lastRow = table[table.length - 1];
    if (optimizationType === "max") {
      return lastRow.indexOf(Math.min(...lastRow)); // минимальный элемент в строке функции цели
    } else {
      return lastRow.indexOf(Math.max(...lastRow)); // максимальный элемент для минимизации
    }
  };


  const findPivotRow = (table, pivotCol) => {
    let ratios = table.slice(0, -1).map(row => {
      const element = row[pivotCol];
      return element > 0 ? row[row.length - 1] / element : Infinity; // находим соотношения
    });
    return ratios.indexOf(Math.min(...ratios));  // строка с минимальным соотношением
  };


  const performPivoting = (table, pivotRow, pivotCol) => {
    const pivotElement = table[pivotRow][pivotCol];

    for (let i = 0; i < table[pivotRow].length; i++) {
      table[pivotRow][i] /= pivotElement;
    }

   
    for (let i = 0; i < table.length; i++) {
      if (i !== pivotRow) {
        const factor = table[i][pivotCol];
        for (let j = 0; j < table[i].length; j++) {
          table[i][j] -= factor * table[pivotRow][j];
        }
      }
    }
  };

  const extractSolution = (table) => {
    const solution = {};
    for (let i = 0; i < table.length - 1; i++) {
      solution[`x${i + 1}`] = table[i][table[i].length - 1];
    }
    return solution;
  };

  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();

    // Преобразуем введенные данные в массивы
    const objFunc = objectiveFunction.split(',').map(Number);
    const constraintsArr = constraints.split('\n').map(c => {
      const parts = c.split(' ');
      return {
        coefficients: parts[0].split(',').map(Number),
        sign: parts[1],  // <=, >=
        value: Number(parts[2])
      };
    });

    // Преобразуем задачу к симплексной таблице
    const simplexTable = createSimplexTable(objFunc, constraintsArr);

    // Решаем симплексным методом
    const solution = solveSimplex(simplexTable);

    // Выводим результат
    setResult(solution);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Решение задачи линейного программирования</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Функция цели:</label>
          <input 
            type="text" 
            value={objectiveFunction} 
            onChange={(e) => setObjectiveFunction(e.target.value)} 
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Пример: 3,2,-1" 
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Ограничения:</label>
          <textarea 
            value={constraints} 
            onChange={(e) => setConstraints(e.target.value)} 
            rows="5" 
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Пример: 2,1,3 <= 10"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Тип задачи:</label>
          <select 
            value={optimizationType} 
            onChange={(e) => setOptimizationType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="max">Максимизация</option>
            <option value="min">Минимизация</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Решить задачу
        </button>
      </form>

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Результат:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SimplexSolver;
