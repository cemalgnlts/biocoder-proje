const form = document.forms[0];

let updatedProductFormData;

let formStepBtnPrev = null;
let formStepBtnNext = null;
let formGroupItems = [];
let formStep = 0;

// İlçe ve toplam ürün adedi inputlarını hareketli yap.
function initForms() {
    const elements = form.elements;

    elements.il.onchange = () => {
        elements.ilce.innerHTML = '<option value="İlçe Seçin">İlçe seçin</option>';
        if (ililce[il.value])
            elements.ilce.innerHTML += ililce[il.value].map(title => `<option value="${title}">${title}</option>`);
    };

    elements.productQuantity.oninput = calculateEmptyProductQuantity;
    elements.robustProductQuantity.oninput = calculateEmptyProductQuantity;
    elements.brokenProductQuantity.oninput = calculateEmptyProductQuantity;
}

function calculateEmptyProductQuantity() {
    const prdctQty = form.elements.productQuantity.valueAsNumber || 0;
    const rbstPrdctQty = form.elements.robustProductQuantity.valueAsNumber || 0;
    const brkPrdctQty = form.elements.brokenProductQuantity.valueAsNumber || 0;
    form.elements.emptyProductQuantity.value = prdctQty - (rbstPrdctQty + brkPrdctQty);
}

// Ürün detay sayfasındaki sekmeleri duyarlı yap.
function initTabs() {
    document.querySelectorAll("[data-target]").forEach(el => el.onclick = ev => {
        document.querySelector("li.is-active").classList.remove("is-active")
        document.querySelector(".tab-target.active").classList.remove("active");

        ev.target.parentElement.classList.add("is-active");

        const target = ev.target.dataset.target;
        document.querySelector("#" + target).classList.add("active");
    });

    updatedProductFormData = {
        info: new FormData(),
        heat: new FormData(),
        moisture: new FormData(),
        weight: new FormData()
    };

    document.querySelectorAll("form").forEach(form => form.onchange = (ev) => productDataUpdated(form, ev));
}

function productDataUpdated(form, ev) {
    const input = ev.target;

    const name = form.name === "info" ? input.name : input.id.split("-")[1];

    updatedProductFormData[form.name].set(name, input.value);
}

function updateProduct(type) {
    if (type === "info") {
        // Ürün ekleme sayfası adımlı olduğu için burada hata almadıkça adımları arttır.
        formStep = 1;
        if (!productFormControl()) return;
        formStep = 2;
        if (!productFormControl()) return;
        formStep = 6;
        if (!productFormControl()) return;

        clearFormMessages();
    }

    document.querySelector("#save-btn-" + type).classList.add("is-loading");
    document.querySelector("#deleteProduct").classList.add("is-loading");

    fetch(`/dashboard/products/${type}/${productId}`, {
        method: "PATCH",
        body: new URLSearchParams(updatedProductFormData[type]),
    }).then(res => res.json())
        .then(onProductUpdated)
        .catch(console.error);
}

function onProductUpdated(res) {
    document.querySelector("[id^=save-btn].is-loading").classList.remove("is-loading");
    document.querySelector("#deleteProduct").classList.remove("is-loading");

    const info = document.querySelector(".product-updated-notification");
    info.classList.remove("is-info", "is-danger");
    info.style.display = "block";
    const title = info.querySelector(".is-text");
    info.scrollIntoView({ block: "start", behavior: "smooth" });

    if (!res.ok) {
        info.classList.add("is-danger");
        title.textContent = res.message;
        return;
    }

    updatedProductFormData[res.type] = new FormData();
    info.classList.add("is-success");
    title.textContent = "Ürün Güncellendi.";
}

function deleteProduct() {
    if (confirm("Bu işlem geri alınamaz!\nSilmek istediğinizden emin misiniz?")) {
        const delBtn = document.querySelector("#deleteProduct");
        delBtn.classList.add("is-loading");
        delBtn.previousElementSibling.classList.add("is-loading");

        fetch("/dashboard/" + productId, {
            method: "DELETE"
        }).then(res => res.json())
            .then(onDeleteProduct)
            .catch(console.error);
    }
}

function onDeleteProduct(res) {
    const delBtn = document.querySelector("#deleteProduct");
    delBtn.classList.remove("is-loading");
    delBtn.previousElementSibling.classList.remove("is-loading");

    if (!res.ok) {
        console.error(res.message);
        alert(res.message);
        return;
    }

    window.location.href = "/dashboard/products";
}

function onGPSResult(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    form.location.value = `${lat},${lon}`;

    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely,current,alerts&lang=tr&appid=${weatherApiKey}`)
        .then(res => res.json())
        .then(weatherReport)
        .catch(console.error);

    fetch(`https://geocode.xyz/${lat},${lon}?geoit=json`)
        .then(res => res.json())
        .then(coordinatResult)
        .catch(console.error);

    document.querySelector(".gps-notify").style.display = "none";
    document.querySelectorAll(".no-gps-overlay").forEach(el => el.style.display = "none");
}

function coordinatResult(res) {
    document.querySelector(".location-name").textContent = `${res.city}/${res.country}`;
}

function weatherReport(res) {
    const weatherData = [];

    const weatherContainer = document.querySelector(".weather-container");

    res.daily.slice(0, 5).forEach(day => {
        const weather = day.weather[0];
        const icon = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        const desc = weather.description;
        const dayName = new Date(day.dt * 1000)
            .toLocaleDateString("tr-TR", { weekday: "long" });

        const temp = `<div class="column is-4 has-text-centered">
            <img src="${icon}" alt="${dayName} günü hava tahmini ${desc}" />
            <p><strong>${desc}</strong></p>
            <p>${dayName}</p>
        </div>`;

        weatherData.push(desc);

        weatherContainer.insertAdjacentHTML("beforeend", temp)
    });

    document.querySelector("#weather").value = weatherData.join(",");
}

function onGPSError(err) {
    let msg = "";

    switch (err.code) {
        case err.PERMISSION_DENIED:
            msg = "Konum izni verilmedi.";
            document.querySelector(".gps-notify-no-dialog-text").style.display = "inline";
            break;
        case err.POSITION_UNAVAILABLE:
            msg = "Konum bilgisi mevcut değil.";
            break;
        case err.TIMEOUT:
            msg = "Konum alma isteği zaman aşımına uğradı.";
            break;
        default:
            msg = "Bilinmeyen bir hata oluştu.";
    }

    document.querySelector(".gps-notify").style.display = "block";

    const gpsInfo = document.querySelector(".gps-info");
    gpsInfo.textContent = msg;
    gpsInfo.classList.add("has-text-warning-dark");

    console.error(msg);
}

function initGeolocation() {
    document.querySelector(".gps-info").textContent = "Konum bilgileri bekleniyor...";
    navigator.geolocation.getCurrentPosition(onGPSResult, onGPSError);
}

function initHome() {
    initGeolocation();
    document.querySelector(".gps-notify").onclick = initGeolocation;

    initForms();

    // Ekran boyutu değiştiğinde hangi form adımında ise o adıma kaydır.
    // Diğer türlü formun başka bir noktası görünüyor.
    document.body.onresize = () => form.scrollTo(form.clientWidth * formStep, 0);

    formGroupItems = document.querySelectorAll(".form-group");
    formStepBtnPrev = document.querySelector(".form-step-prev");
    formStepBtnNext = document.querySelector(".form-step-next");

    formStepBtnPrev.onclick = () => goToForm(-1);
    formStepBtnNext.onclick = () => goToForm(1);

    document.querySelectorAll("[name^=heatDate],[name^=moistureDate]")
        .forEach(inp => inp.setAttribute("disabled", "disabled"));

    const date = new Date();
    document.querySelectorAll("[name^=weightDate]")
        .forEach(inp => {
            inp.textContent = date.toLocaleDateString("tr-TR");
            inp.setAttribute("disabled", "disabled");
            date.setDate(date.getDate() + 1);
        });
}

function goToForm(step) {
    if (step === 1 && !productFormControl()) return;

    clearFormMessages();

    formStep = formStep + step;

    if (formStep < 1)
        formStepBtnPrev.setAttribute("disabled", "");
    else if (formStepBtnPrev.hasAttribute("disabled"))
        formStepBtnPrev.removeAttribute("disabled");

    if (formStep === formGroupItems.length - 1) {
        formStepBtnNext.textContent = "BİTİR";
        formStepBtnNext.classList.replace("is-info", "is-success");
        formStepBtnNext.onclick = sendProduct;
    } else if (formStepBtnNext.classList.contains("is-success")) {
        formStepBtnNext.textContent = "Devam Et";
        formStepBtnNext.classList.replace("is-success", "is-info");
        formStepBtnNext.onclick = () => goToForm(1);
    }

    const width = form.offsetParent.clientWidth;

    form.scrollBy({
        left: step === 1 ? width : -width,
        behavior: "smooth"
    });

    const prg = document.querySelector(".progress");
    prg.value = (formStep / formGroupItems.length) * 100;
}

function sendProduct() {
    if (!productFormControl()) return; // Bitirmeden önce son form kontrolü.
    document.querySelector(".progress").value = 100;
    formStepBtnNext.classList.add("is-loading");

    const data = new FormData(form);

    fetch("/dashboard", {
        method: "POST",
        body: new URLSearchParams(data)
    }).then(res => res.json())
        .then(onProductAdded)
        .catch(console.error);
}

function onProductAdded(res) {
    document.querySelector(".progress").value = 0;
    formGroupItems[0].scrollIntoView({ behavior: "smooth" });
    formStep = 0;

    formStepBtnNext.classList.remove("is-loading");
    formStepBtnNext.textContent = "Devam Et";
    formStepBtnNext.classList.replace("is-success", "is-info");
    formStepBtnNext.onclick = () => goToForm(1);

    if (!res.ok) {
        console.error(res.message);
        alert(res.message);
        return;
    }

    form.reset();
}

// İkinci adımdaki ağırlık, nem, ısı için kontrolü geçmek için.
// noStep true değeri almalı.
function productFormControl(noStep) {
    const formValidator = new FormValidator(form);

    if (formStep === 1) {
        formValidator.with("businessNo")
            .rule(/^\d{2}/, "İlk iki hane plaka kodu olmalı!")
            .checkLength(14, "İşletme numaranız 14 karakterden oluşmalı!");

        formValidator.with("address")
            .isEmpty("Bu alan boş bırakılamaz")
            .max(150, "En fazla 150 karakterden oluşmalı.");

        formValidator.with("il")
            .equal("il seçin", "Bir il seçin.")

        formValidator.with("ilce")
            .equal("önce il seçin", "İl seçildikten sonra etkinleşir.")
            .equal("ilçe seçin", "Bir ilçe seçin");

        formValidator.with("location")
            .isEmpty("Konum izni verilince doldurulacak");

        formValidator.with("weather")
            .isEmpty("Konum izni verilince doldurulacak");
    }

    else if (formStep === 2) {
        formValidator.with("productQuantity")
            .isEmpty("Ürün adetini girin")
            .max(4, "En fazla 4 karakter olabilir");

        formValidator.with("productType")
            .equal("ürün cinsini seçin", "Ürün cinsini seçmediniz");
    }

    else if (formStep === 3) {
        //formValidator.with("heat").isEmpty("Bu alanı doldurun");
    }

    else if (formStep === 4) {
        //     formValidator.with("moisture").isEmpty("Bu alanı doldurun");
    }

    else if (formStep === 5) {
        //     formValidator.with("weight").isEmpty("Bu alanı doldurun");
    }

    else if (formStep === 6) {
        formValidator.with("productSize2020")
            .isEmpty("Bu alanı doldurun.")
            .max(5, "En fazla beş haneli olabilir");

        formValidator.with("productSize2021")
            .isEmpty("Bu alanı doldurun.")
            .max(5, "En fazla beş haneli olabilir");

        formValidator.with("productSize2022")
            .isEmpty("Bu alanı doldurun.")
            .max(5, "En fazla beş haneli olabilir");
    }

    if (!formValidator.isPassed()) {
        formValidator.showErrors();

        document.querySelector("form .help")
            .scrollIntoView({ behavior: "smooth", block: "center" });

        return false;
    }

    return true;
}

function loginFormControl() {
    const formValidator = new FormValidator(form);

    formValidator.with("id")
        .checkLength(11, "T.C. kimlik numaranız 11 karakterden oluşmalı!");

    formValidator.with("password")
        .min(8, "Şifreniz minimum 8 karakterden oluşmalı!");

    if (!formValidator.isPassed()) {
        formValidator.showErrors();

        return false;
    }

    return true;
}

function registerFormControl() {
    const formValidator = new FormValidator(form);

    formValidator.with("id")
        .checkLength(11, "T.C. kimlik numaranız 11 karakterden oluşmalı!")
        .rule(/[2468]$/, "T.C. kimlik numarası çift hane ile bitmeli.");

    formValidator.with("password")
        .min(8, "Şifreniz minimum 8 karakterden oluşmalı!")
        .rule(/\d/, "En az bir sayı içermeli")
        .rule(/[a-z]/, "En az bir küçük harf içermeli!")
        .rule(/[A-Z]/, "En az bir büyük harf içermeli");

    if (!formValidator.isPassed()) {
        formValidator.showErrors();
        return false;
    }

    return true;
}

// Formlardaki hata mesajlarını ve renkleri kaldırmaya zorla.
function clearFormMessages() {
    const inputs = document.querySelectorAll("form .is-danger");
    if (inputs.length)
        inputs.forEach(input => {
            input.classList.remove("is-danger");
            const helpers = input.parentElement.querySelector(".helpers");
            helpers && helpers.remove();
        });
}

// Form doğrulama için yardımcı sınıf.
class FormValidator {
    constructor(formData) {
        this.formData = formData;
        this.elements = formData.elements;
        this.element = null;
        this.messages = {};
    }

    with(name) {
        if (!this.elements[name])
            console.error("FormValidator: Element not found name:", name);

        this.value = this.elements[name].value;
        this.messages[name] = [];
        this.name = name;
        return this;
    }

    checkLength(size, msg) {
        this._addError(this.value.length !== size, msg);
        return this;
    }

    isEmpty(msg) {
        this._addError(this.value.trim().length === 0, msg);
        return this;
    }

    equal(txt, msg) {
        this._addError(this.value.toLocaleLowerCase("tr-TR") === txt.toLocaleLowerCase("tr-TR"), msg);
        return this;
    }

    min(min, msg) {
        this._addError(this.value.length < min, msg);
        return this;
    }

    max(max, msg) {
        this._addError(this.value.length > max, msg);
        return this;
    }

    rule(regexp, msg) {
        this._addError(!regexp.test(this.value), msg);
        return this;
    }

    includes(arr, msg) {
        this._addError(arr.includes(this.value), msg);
        return this;
    }

    _addError(cond, msg) {
        if (cond)
            this.messages[this.name]
                .push(`<p class="help is-danger">&times; ${msg}</p>`);
    }

    isPassed() {
        return Object.values(this.messages)
            .every(arr => arr.length === 0);
    }

    showErrors() {
        for (const [name, errors] of Object.entries(this.messages)) {
            const input = this.elements[name].tagName === "SELECT"
                ? this.elements[name].parentElement
                : this.elements[name];
            input.classList.toggle("is-danger", errors.length > 0);

            this.fieldDiv = input.parentElement;

            this.helperDiv = this.fieldDiv.getElementsByClassName("helpers");

            if (this.helperDiv.length !== 0)
                this.helperDiv[0].innerHTML = "";
            else
                this.fieldDiv.insertAdjacentHTML("beforeEnd", '<div class="helpers"></div>');

            this.helperDiv[0].insertAdjacentHTML("beforeEnd", errors.join(""));
        }
    }
}
