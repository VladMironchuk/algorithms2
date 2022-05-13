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
