module.exports.productFormControl = data => {
    const formValidator = new FormValidator(data);

    formValidator.with("businessNo")
        .rule(/^\d{2}/)
        .checkLength(14);

    formValidator.with("address")
        .isEmpty()
        .max(150);

    formValidator.with("il")
        .equal("il seçin")

    formValidator.with("ilce")
        .equal("önce il seçin")
        .equal("ilçe seçin");

    formValidator.with("location")
        .isEmpty();

    formValidator.with("weather")
        .isEmpty();

    formValidator.with("productQuantity")
        .isEmpty()
        .max(4);

    formValidator.with("productType")
        .equal("ürün cinsini seçin");

    formValidator.with("productSize2020")
        .max(5);

    formValidator.with("productSize2021")
        .max(5);

    formValidator.with("productSize2022")
        .max(5);

    return formValidator.isPassed();
}

module.exports.registerFormControl = data => {
    const formValidator = new FormValidator(data);

    formValidator.with("id")
        .checkLength(11)
        .rule(/[2468]$/);

    formValidator.with("name")
        .isEmpty();

    formValidator.with("email")
        .isEmpty();

    formValidator.with("password")
        .min(8)
        .rule(/\d/)
        .rule(/[a-z]/)
        .rule(/[A-Z]/);

    return formValidator.isPassed();
}

module.exports.loginFormControl = (data) => {
    const formValidator = new FormValidator(data);

    formValidator.with("id")
        .checkLength(11);

    formValidator.with("password")
        .min(8);

    return formValidator.isPassed();
}

// Form doğrulama için yardımcı sınıf.
class FormValidator {
    constructor(formData) {
        this.formData = formData;
        this._isPassed = true;
    }

    with(name) {
        this.value = this.formData[name];
        return this;
    }

    checkLength(len) {
        return this._control(this.value.length !== len);
    }

    isEmpty() {
        return this._control(this.value.trim().length === 0);
    }

    equal(txt) {
        return this._control(this.value.toLocaleLowerCase("tr-TR") === txt.toLocaleLowerCase("tr-TR"));
    }

    min(min) {
        return this._control(this.value.length < min);
    }

    max(max) {
        return this._control(this.value.length > max);
    }

    rule(regexp) {
        return this._control(!regexp.test(this.value));
    }

    _control(cond) {
        if (cond) this._isPassed = false;
        return this;
    }

    isPassed() {
        return this._isPassed;
    }
}