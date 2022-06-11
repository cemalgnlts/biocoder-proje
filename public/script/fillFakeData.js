function fillFakeData() {
	const $ = q => document.querySelector("#" + q);
	const next = () => document.querySelector(".form-step-next").click();
	const rnd = (min, max) => Math.floor(Math.random() * (max - min)) + min;
	const floatRnd = (fix=2) => (Math.random() * 30).toFixed(fix)

	next();

	$("businessNo").value = `${rnd(10,81)}ABC123456789`;
	$("address").value = `Gündoğudu Mahallesi ${rnd(1000, 5000)} sokak no ${rnd(1, 100)}`;
	$("il").value = "Mersin";
	$("il").onchange();
	$("ilce").value = "Akdeniz";
	$("location").value = `46.12345,47.123456`;
	$("weather").value = "Güneşli,Bulutlu,Parçalı Bulutlu,Yağmurlu,Güneşli";
	
	next();
	
	$("productType").value = "Anadolu";
	$("productQuantity").value = rnd(50, 100);
	$("robustProductQuantity").value = rnd(25, 50);
	$("brokenProductQuantity").value = rnd(0, 25);
	$("productQuantity").oninput();

	next();

	form.elements["heat[]"].forEach((inp, i) => inp.value = i);

	next();

	form.elements["moisture[]"].forEach((inp, i) => inp.value = i);

	next();

	form.elements["weight[]"].forEach((inp, i) => inp.value = i);
	
	next();

	$("productSize2020").value = rnd(10, 2000);
	$("productSize2021").value = rnd(100, 3000);
	$("productSize2022").value = rnd(1000, 4000);

	next();
}
