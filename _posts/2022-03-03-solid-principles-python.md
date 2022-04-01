---
layout: post
title: "SOLID Principles in Python"
author: jkfran
categories: [blog]
image: https://user-images.githubusercontent.com/6353928/156574349-a8e92eda-c016-4a51-9c8c-6776cefd7f49.png
---

These five principles are not a specific ordered list (do this, then that, etc.) but a collection of best practices. It's a mnemonic vehicle to be remembered.

S - Single-responsibility Principle

O - Open-closed Principle

L - Liskov Substitution Principle

I - Interface Segregation Principle

D - Dependency Inversion Principle

If you follow these principles, you can improve your code's reliability by working on its structure and logical consistency.

## Single-responsibility Principle

> One class = one job

In other words, every component of your code (in general a class, but also a function) should have one and only one responsibility.

Bad:

```python
import numpy as np

def math_operations(list_):
    # Compute Average
    print(f"the mean is {np.mean(list_)}")
    # Compute Max
    print(f"the max is {np.max(list_)}")

math_operations(list_ = [1,2,3,4,5])
# the mean is 3.0
# the max is 5
```

Better:

```python
def get_mean(list_):
    '''Compute Mean'''
    print(f"the mean is {np.mean(list_)}")

def get_max(list_):
    '''Compute Max'''
    print(f"the max is {np.max(list_)}")

def main(list_):
    # Compute Average
    get_mean(list_)
    # Compute Max
    get_max(list_)

main([1,2,3,4,5])
# the mean is 3.0
# the max is 5
```

## Open-closed Principle

> No need to modify the code you have already written to accommodate new functionality, but add what you now need

Bad:

```python
class Album:
    def __init__(self, name, artist, songs, genre):
        self.name = name
        self.artist = artist
        self.songs = songs
        self.genre = genre#before
class AlbumBrowser:
    def search_album_by_artist(self, albums, artist):
        return [album for album in albums if album.artist == artist]    def search_album_by_genre(self, albums, genre):
        return [album for album in albums if album.genre == genre]
```

Better:

```python
class SearchBy:
    def is_matched(self, album):
        pass

class SearchByGenre(SearchBy):
    def __init__(self, genre):
        self.genre = genre    def is_matched(self, album):
        return album.genre == self.genre

class SearchByArtist(SearchBy):
    def __init__(self, artist):
        self.artist = artist    def is_matched(self, album):
        return album.artist == self.artist

class AlbumBrowser:
    def browse(self, albums, searchby):
        return [album for album in albums if searchby.is_matched(album)]
```

## Liskov Substitution Principle

> Functions that use pointers or references to base classes must be able to use objects of derived classes without knowing it

If you redefine a function in a subclass that is also present in the base class, the two functions should have the same behaviour. This does not mean that they must be mandatorily equal, but that the user should expect the same type of result, given the same input.

Bad:

```python
class Vehicle:
   """A demo Vehicle class"""

   def __init__(self, name: str, speed: float):
       self.name = name
       self.speed = speed

   def get_name(self) -> str:
       """Get vehicle name"""
       return f"The vehicle name {self.name}"

   def get_speed(self) -> str:
       """Get vehicle speed"""
       return f"The vehicle speed {self.speed}"

   def engine(self):
       """A vehicle engine"""
       pass

   def start_engine(self):
       """A vehicle engine start"""
       self.engine()


class Car(Vehicle):
   """A demo Car Vehicle class"""
   def start_engine(self):
       pass


class Bicycle(Vehicle):
   """A demo Bicycle Vehicle class"""
   def start_engine(self):
       pass
```

Better:

```python
class Vehicle:
   """A demo Vehicle class"""
   def __init__(self, name: str, speed: float):
       self.name = name
       self.speed = speed   def get_name(self) -> str:
       """Get vehicle name"""
       return f"The vehicle name {self.name}"   def get_speed(self) -> str:
       """Get vehicle speed"""
       return f"The vehicle speed {self.speed}"class VehicleWithoutEngine(Vehicle):
   """A demo Vehicle without engine class"""
   def start_moving(self):
      """Moving"""
      raise NotImplementedclass VehicleWithEngine(Vehicle):
   """A demo Vehicle engine class"""
   def engine(self):
      """A vehicle engine"""
      pass   def start_engine(self):
      """A vehicle engine start"""
      self.engine()class Car(VehicleWithEngine):
   """A demo Car Vehicle class"""
   def start_engine(self):
       passclass Bicycle(VehicleWithoutEngine):
   """A demo Bicycle Vehicle class"""
   def start_moving(self):
       pass
```

LSP is a concept that applies to all kinds of polymorphism. If you don't use polymorphism, you don't need to care about the LSP.

## Interface Segregation Principle

> A class should only have the interface needed and avoid methods that won't work or that have no reason to be part of that class

Bad:

```python
class Mammals(ABC):
    @abstractmethod
    def swim() -> bool:
        print("Can Swim")

    @abstractmethod
    def walk() -> bool:
        print("Can Walk")

class Human(Mammals):
    def swim():
        return print("Humans can swim")

    def walk():
        return print("Humans can walk")

class Whale(Mammals):
    def swim():
        return print("Whales can swim")
```

Better:

```python
class Walker(ABC):
  @abstractmethod
  def walk() -> bool:
    return print("Can Walk")

class Swimmer(ABC):
  @abstractmethod
  def swim() -> bool:
    return print("Can Swim")

class Human(Walker, Swimmer):
  def walk():
    return print("Humans can walk")
  def swim():
    return print("Humans can swim")

class Whale(Swimmer):
  def swim():
    return print("Whales can swim")
```

## The Dependency Inversion Principle

> Entities must depend on abstractions, not on concretions

The best example is a DB connection in our application. We probably want to use an abstraction when we use the DB, like: `getDBConnection()` instead of `getMySQLConnection()`. This way, we could switch from MySQL to Postgres effortlessly.

Bad:

```python
class FXConverter:
    def convert(self, from_currency, to_currency, amount):
        print(f'{amount} {from_currency} = {amount * 1.2} {to_currency}')
        return amount * 1.2

class App:
    def start(self):
        converter = FXConverter()
        converter.convert('EUR', 'USD', 100)


if __name__ == '__main__':
    app = App()
    app.start()
```

Better:

```python
class CurrencyConverter(ABC):
    def convert(self, from_currency, to_currency, amount) -> float:
        pass


class FXConverter(CurrencyConverter):
    def convert(self, from_currency, to_currency, amount) -> float:
        print('Converting currency using FX API')
        print(f'{amount} {from_currency} = {amount * 1.2} {to_currency}')
        return amount * 1.15


class AlphaConverter(CurrencyConverter):
    def convert(self, from_currency, to_currency, amount) -> float:
        print('Converting currency using Alpha API')
        print(f'{amount} {from_currency} = {amount * 1.2} {to_currency}')
        return amount * 1.2


class App:
    def __init__(self, converter: CurrencyConverter):
        self.converter = converter

    def start(self):
        self.converter.convert('EUR', 'USD', 100)


if __name__ == '__main__':
    converter = AlphaConverter()
    app = App(converter)
    app.start()
```
