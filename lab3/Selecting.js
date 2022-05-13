const { GeneticValue } = require('./GeneticValue');

class Selecting {
  constructor(
    target,
    populationSize,
    valueMin,
    valueMax,
    valuesForSelection,
    valuesForMutation,
    mutationChance,
    substitutionChance
  ) {
    this._target = target;

    this._populationSize = populationSize;
    this._valueMin = valueMin;
    this._valueMax = valueMax;
    this._valuesForSelection = valuesForSelection;
    this._valuesForMutation = valuesForMutation;
    this._mutationChance = mutationChance;
    this._substitutionChance = substitutionChance;

    this.generateInitialPopulation();
  }

  randomIntNext(min, max) {
    return Math.round(min - 0.5 + Math.random() * (max - min + 1));
  }

  static generateBorder() {
    return Selecting.randomIntNext(0, 4);
  }

  static useOnePointCrossover(valueA, valueB) {
    const border = Selecting.generateBorder();

    const newValueA = valueA.clone();
    for (let i = border; i < GeneticValue.count; i++) {
      newValueA.setValue(i, valueB.getValue(i));
    }

    const newValueB = valueB.clone();
    for (let i = border; i < GeneticValue.count; i++) {
      newValueB.setValue(i, valueA.getValue(i));
    }

    return [newValueA, newValueB];
  }

  static useMultiPointCrossover(valueA, valueB) {
    const [borderOne, borderTwo] = [
      Selecting.generateBorder(),
      Selecting.generateBorder(),
    ];
    const borderMin = Math.min(borderOne, borderTwo);
    const borderMax = Math.max(borderOne, borderTwo);

    const newValueA = valueA.clone();
    for (let i = borderMin; i <= borderMax; i++) {
      newValueA.setValue(i, valueB.getValue(i));
    }

    const newValueB = valueB.clone();
    for (let i = borderMin; i <= borderMax; i++) {
      newValueB.setValue(i, valueA.getValue(i));
    }

    return [newValueA, newValueB];
  }

  static useCrossing(selected, oddIteration) {
    const childValues = [];
    for (let i = 0; i + 1 <= selected.length; i += 2) {
      const [childA, childB] = oddIteration
        ? Selecting.useOnePointCrossover(selected[i], selected[i + 1])
        : Selecting.useMultiPointCrossover(selected[i], selected[i + 1]);
      childValues.push(childA);
      childValues.push(childB);
    }
    return childValues;
  }

  useGeneticSelecting() {
    for (let iteration = 0; ; iteration++) {
      let selected = this.useRandomSelection();
      let childValues = Selecting.useCrossing(selected, iteration % 2 !== 0);
      this.useMutationForUnsuitable(childValues);
      this.useSubstitution(childValues);

      const targets = this._population.map((value) => this._target(value));
      let minValue = Math.min(...targets);
      console.log(
        `Minimal target = ${minValue}, average target error = ${'add'}`
      );

      if (minValue === 0) {
        this._population.forEach((value) => {
          if (this._target(value) == 0) {
            console.log(`Final value is = ${value}`);
            console.log(`Number of iterations = ${iteration}`);
          }
        });
        break;
      }
    }
  }

  useRandomSelection() {
    return this._population
      .sort(() => Math.random() - 0.5)
      .slice(this._valuesForSelection);
  }

  useMutationForUnsuitable(childValues) {
    const selected = childValues
      .sort((a, b) => {
        const res = this._target(a) - this._target(b);
        return res < 0 ? 1 : -1;
      })
      .slice(this._valuesForMutation);

    selected.forEach((value) => {
      for (let i = 0; i < GeneticValue.count; i++) {
        if (Math.random() <= this._mutationChance) {
          value.setValue(i, this.generateValue());
        }
      }
    });
  }

  useSubstitution(childValues) {
    const chances = this.generateChances(childValues);

    this._population.forEach((value) => {
      if (Math.random() <= this._substitutionChance) {
        const random = Math.random();
        let index = 0;

        for (let i = 0; i < chances.length; i++) {
          if (random < chances[i]) {
            index = i;
            break;
          }
        }
        value.copy(childValues[index]);
        childValues.splice(index, 1);
        chances.splice(index, 1);
      }
    });
  }

  generateChances(values) {
    const chances = [];
    const valuesFitness = [];
    let fitnessSum = 0;

    values.forEach((value) => {
      const target = this._target(value);
      const fitness = 1 / (target === 0 ? 1 : target);
      fitnessSum += fitness;
      valuesFitness.push(fitness);
    });

    for (let i = 0; i < values.length; i++) {
      const fitness = valuesFitness[i];
      const chance = fitness / fitnessSum;
      chances.push(chance);
    }

    chances.sort((a, b) => {
      return a - b < 0 ? 1 : -1;
    });
    return chances;
  }

  generateInitialPopulation() {
    this._population = [];
    for (let i = 0; i < this._populationSize; i++) {
      this._population.push(this.generateGeneticValue());
    }
  }

  generateGeneticValue() {
    return new GeneticValue(
      this.generateValue(),
      this.generateValue(),
      this.generateValue(),
      this.generateValue(),
      this.generateValue()
    );
  }

  generateValue() {
    return Selecting.randomIntNext(this._valueMin, this._valueMax);
  }
}

module.exports = Selecting;
