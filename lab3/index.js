class GeneticValue {
  static count = 5;

  constructor(u, w, x, y, z) {
    this.u = u;
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  setValue(index, value) {
    switch (index) {
      case 0:
        this.u = value;
        break;
      case 1:
        this.w = value;
        break;
      case 2:
        this.x = value;
        break;
      case 3:
        this.y = value;
        break;
      case 4:
        this.z = value;
        break;
      default:
        throw Error('Index out of the rage!');
    }
  }

  getValue(index) {
    switch (index) {
      case 0:
        return this.u;
      case 1:
        return this.w;
      case 2:
        return this.x;
      case 3:
        return this.y;
      case 4:
        return this.z;
      default:
        throw Error('Index out of the rage!');
    }
  }

  copy(value) {
    this.u = value.u;
    this.w = value.w;
    this.x = value.x;
    this.y = value.y;
    this.z = value.z;
  }

  clone() {
    return new GeneticValue(...this.getValues());
  }

  getValues() {
    return [this.u, this.w, this.x, this.y, this.z];
  }
}

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

  static randomIntNext(min, max) {
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
            console.log(`Final value is = `);
            console.log(value);
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

class Targets {
  static getTargetEquationA(value) {
    const [u, w, x, y, z] = value.getValues();
    return Math.abs(
      z + //1 слагаемое
        w * x ** 2 * y ** 2 * z ** 2 + //2 slagaemoe
        u ** 2 * w ** 2 * x * z ** 2 + //3 slagaemoe
        u ** 2 * w * x * y * z ** 2 + //4 slagaemoe
        w ** 2 * x ** 2 * z ** 2 -
        13
    );
  }

  static getTargetEquationB(value) {
    const [u, w, x, y, z] = value.getValues();
    return Math.abs(
      u * w * x ** 2 * y ** 2 * z ** 2 + //1 slagaemoe
        u ** 2 * w * x ** 2 * y ** 2 * z ** 2 + //2 slagaemoe
        w ** 2 * x * y * z + //3 slagaemoe
        u * w ** 2 * x * y ** 2 + //4 slagaemoe
        z +
        50
    );
  }
}

const POPULATION_SIZE = 3000;
const VALUE_MIN = -200;
const VALUE_MAX = 200;

const VALUES_FOR_SELECTION = 50;
const VALUES_FOR_MUTATION = 800;
const MUTATION_CHANCE = 0.5;
const SUBSTITUTION_CHANCE = 0.5;

const target = Targets.getTargetEquationA;

const geneticAlgorithms = new Selecting(
  target,
  POPULATION_SIZE,
  VALUE_MIN,
  VALUE_MAX,
  VALUES_FOR_SELECTION,
  VALUES_FOR_MUTATION,
  MUTATION_CHANCE,
  SUBSTITUTION_CHANCE
);

geneticAlgorithms.useGeneticSelecting();
