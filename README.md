# Kurulum

## Önizleme

https://biocoder-proje.herokuapp.com/dashboard

Proje Heroku üzerinde deploy edilmiştir. Ücretsiz bir servis olduğu için 30 dakika kullanılmadığında bir sonraki sayfaya giriş 1 dakikaya kadar sürebilir. Veritabanı için https://remotemysql.com sayfasından ücretsiz bir hesap alınmıştır.

## Veritabanı

Aşağıdaki kod ile veritabanı oluşturulmalı. Bu kodlar [`database.sql`](database.sql) dosyasında var.
```sql
CREATE DATABASE IF NOT EXISTS biocoder;

use biocoder;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(11) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password BINARY(60) NOT NULL,
  PRIMARY KEY( id )
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT NOT NULL,
  date DATE NOT NULL DEFAULT now(),
  userId CHAR(11) NOT NULL,
  businessNo CHAR(14) NOT NULL,
  address VARCHAR(150) NOT NULL,
  il VARCHAR(50) NOT NULL,
  ilce VARCHAR(50) NOT NULL,
  productType VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(10, 8) NOT NULL,
  weather VARCHAR(250) NOT NULL,
  productQuantity INT(4) NOT NULL,
  robustProductQuantity INT(4) NOT NULL,
  brokenProductQuantity INT(4) NOT NULL,
  productSize2020 INT(5) NOT NULL,
  productSize2021 INT(5) NOT NULL,
  productSize2022 INT(5) NOT NULL,
  PRIMARY KEY ( id ),
  FOREIGN KEY ( userId ) REFERENCES users ( id ) ON DELETE CASCADE
);

-- Isı, nem ve ağırlık için tablolar.

CREATE TABLE IF NOT EXISTS heat (
  id INT NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL DEFAULT now(),
  productId INT NOT NULL,
  time TIME NOT NULL,
  value DECIMAL(10, 1) NOT NULL,
  PRIMARY KEY ( id ),
  FOREIGN KEY ( productId ) REFERENCES products( id ) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS moisture (
  id INT NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL DEFAULT now(),
  productId INT NOT NULL,
  time TIME NOT NULL,
  value DECIMAL(10, 1) NOT NULL,
  PRIMARY KEY ( id ),
  FOREIGN KEY ( productId ) REFERENCES products( id ) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weight (
  id INT NOT NULL AUTO_INCREMENT,
  productId INT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY ( id ),
  FOREIGN KEY ( productId ) REFERENCES products( id ) ON DELETE CASCADE
);
```


**NOT**: Eğer veritabanı mysql versiyonuna bağlı olarak `now()` fonksiyonunu tanımaz ve tabloları oluşturmaz ise tüm alanlar şöyle düzeltilmeli:
```diff
- date DATE NOT NULL DEFAULT now(),
+ date DATE NOT NULL DEFAULT "2022-06-11",
```

Veritabanı için gerekli bilgiler [`.env`](.env) dosyasına girilmeli.

Varsayılan alanlar şöyle:
```env
MYSQL_HOST=127.0.0.1 # Veritabanı host'u
MYSQL_USER=root # Kullanıcı adı.
MYSQL_PASSWORD=root # Kullanıcı Şifresi.
MYSQL_DATABASE=biocoder # İşlemlerin yapılacağı veritabanı.
```

## Node'un Çalıştırılması.

1. Gerekli paketleri kurun `npm install`.
2. Konsola `npm start` yazarak sunucu başlatılmalı.


> Not: Ürün ekleme işlemini hızlandırmak için geliştirici konsolunu açıp `fillFakeData()` yazılıp çalıştırılırsa otomatik olarak bir ürün girer ve kaydeder. Bunun için dashboard sayfasında olmalısınız ve formda ilerleme kaydetmemiş (Bir Ürün Ekleyin.
 adımında) olmanız gerekir.
