class Targets {
  static getTargetEquationA(value) {
    const [u, w, x, y, z] = value.getValues();
    return Math.abs(
      x * y * z + //-------------
        x * y * z ** 2 + //---------------
        y + //--------------
        u * x * y ** 2 * z ** 2 + //--------------
        w ** 2 * x * y ** 2 * z +
        50
    );
  }

  static getTargetEquationB(value) {
    const [u, w, x, y, z] = value.getValues();
    return Math.abs(
      u * w ** 2 * x * y + //-------------
        u ** 2 * w * x ** 2 * y ** 2 * z + //---------------
        u ** 2 * w ** 2 * x ** 2 * z ** 2 + //--------------
        y + //--------------
        w ** 2 * x * y ** 2 * z ** 2 -
        40
    );
  }
}

module.exports = Targets;
