# Full Question Bank


## Module 1

### 1. What is C?
**Answer:** C is a general-purpose, procedural computer programming language supporting structured programming. Developed in 1972 by Dennis Ritchie at Bell Labs, it is known for its efficiency and is widely used for system programming (OS kernels), embedded systems, and high-performance applications.

---

### 2. What are variables?
**Answer:** A variable is a named storage location in memory that holds a value. It acts as a container for data that can be changed during program execution. Every variable in C must be declared with a specific data type (e.g., int age = 25;).

---

### 3. What are data types?
**Answer:** Data types specify the type of data that a variable can store. They determine the size (memory allocation) and the operations that can be performed on the data. Common types include int, float, and char.

---

### 4. Primitive vs. Non-Primitive
**Answer:** Primitive: Built-in types like int, char, float. They store single values. Non-Primitive: Derived types like Arrays, Structures, Unions, and Pointers. They can store multiple values or complex data.

---

### 5. Primitive & Non-primitive Details
**Answer:** Primitive: Stored directly in the stack; predefined by the language. Non-Primitive: Usually refer to objects or collections of data; defined by the programmer.

---

### 6. Pre and Post Increment
**Answer:** Pre-increment (++i): Increments the value first, then returns it. Post-increment (i++): Returns the current value first, then increments it.

---

### 7. What are conditional statements?
**Answer:** Statements like if, else if, else, and switch that allow the program to make decisions and execute specific blocks of code based on conditions.

---

### 8. Why are conditionals used?
**Answer:** They allow programs to handle different inputs, manage errors, and create complex logic paths instead of just executing code line-by-line.

---

### 9. Difference between if and if-else
**Answer:** if executes code only if a condition is true. if-else provides an alternative block of code to execute if the initial condition is false.

---

### 10. What is the switch statement?
**Answer:** A control statement that allows a variable to be tested for equality against a list of values (cases). It is often more readable than nested if-else blocks.

---

### 11. What is a loop?
**Answer:** A sequence of instructions that is continually repeated until a certain condition is reached.

---

### 12. Types of loops
**Answer:** 1. for: Used when iterations are known. 2. while: Checks condition before execution. 3. do-while: Executes at least once before checking condition.

---

### 13. Break vs Continue
**Answer:** break: Exits the loop entirely. continue: Skips the rest of the current iteration and jumps to the next one.

---

### 14. Functions and Types
**Answer:** A function is a block of code which only runs when it is called. Types: 1. Standard Library (e.g., printf) 2. User-defined (created by the programmer).

---

### 15. Use For Loop
**Answer:** _No guidance provided._

---


## Module 2

### 16. What is C?
**Answer:** C is a general-purpose, procedural computer programming language supporting structured programming. Developed in 1972 by Dennis Ritchie at Bell Labs, it is known for its efficiency and is widely used for system programming (OS kernels), embedded systems, and high-performance applications.

---

### 17. What are variables?
**Answer:** A variable is a named storage location in memory that holds a value. It acts as a container for data that can be changed during program execution. Every variable in C must be declared with a specific data type (e.g., int age = 25;).

---

### 18. What are data types?
**Answer:** Data types specify the type of data that a variable can store. They determine the size (memory allocation) and the operations that can be performed on the data. Common types include int, float, and char.

---

### 19. Primitive vs. Non-Primitive
**Answer:** Primitive: Built-in types like int, char, float. They store single values. Non-Primitive: Derived types like Arrays, Structures, Unions, and Pointers. They can store multiple values or complex data.

---

### 20. Primitive & Non-primitive Details
**Answer:** Primitive: Stored directly in the stack; predefined by the language. Non-Primitive: Usually refer to objects or collections of data; defined by the programmer.

---

### 21. Pre and Post Increment
**Answer:** Pre-increment (++i): Increments the value first, then returns it. Post-increment (i++): Returns the current value first, then increments it.

---

### 22. What are conditional statements?
**Answer:** Statements like if, else if, else, and switch that allow the program to make decisions and execute specific blocks of code based on conditions.

---

### 23. Why are conditionals used?
**Answer:** They allow programs to handle different inputs, manage errors, and create complex logic paths instead of just executing code line-by-line.

---

### 24. Difference between if and if-else
**Answer:** if executes code only if a condition is true. if-else provides an alternative block of code to execute if the initial condition is false.

---

### 25. What is the switch statement?
**Answer:** A control statement that allows a variable to be tested for equality against a list of values (cases). It is often more readable than nested if-else blocks.

---

### 26. What is a loop?
**Answer:** A sequence of instructions that is continually repeated until a certain condition is reached.

---

### 27. Types of loops
**Answer:** 1. for: Used when iterations are known. 2. while: Checks condition before execution. 3. do-while: Executes at least once before checking condition.

---

### 28. Break vs Continue
**Answer:** break: Exits the loop entirely. continue: Skips the rest of the current iteration and jumps to the next one.

---

### 29. Functions and Types
**Answer:** A function is a block of code which only runs when it is called. Types: 1. Standard Library (e.g., printf) 2. User-defined (created by the programmer).

---

### 30. How do you find the size of a data type without using sizeof?
**Answer:** Use pointer arithmetic: (char*)(&var + 1) - (char*)(&var). By incrementing a pointer to the variable and subtracting the original address, you get the size in bytes.

---

### 31. Difference between Static and Dynamic memory allocation?
**Answer:** Static: Allocated at compile-time on the Stack; size cannot change. Dynamic: Allocated at runtime on the Heap using malloc()/calloc(); size can be adjusted with realloc().

---

### 32. What is the static keyword?
**Answer:** 1. Inside function: Retains value between calls. 2. Global: Limits visibility to the current file only (internal linkage).

---

### 33. What is a Function Pointer?
**Answer:** A variable that stores the address of a function, which can then be called through that pointer. Useful for callbacks and task scheduling.

---

### 34. Difference between struct and union?
**Answer:** Struct: Each member has its own memory location; total size is the sum of members. Union: All members share the same memory; size is the size of the largest member.

---

### 35. Can switch handle strings or floats?
**Answer:** No. C switch only accepts integral types (int, char, enum). For strings or floats, you must use if-else chains.

---

### 36. Difference between array and pointer?
**Answer:** An array is a constant pointer to a block of memory; a pointer is a variable that can hold any address and be reassigned.

---


## Module 3

### 37. What is Object Oriented Programming (OOP)?
**Answer:** Object Oriented Programming is a programming paradigm that organizes code using objects and classes.
It helps in reusability, security, and easy maintenance of code.

---

### 38. What are the four pillars of OOP?
**Answer:** The four pillars of OOP are:
1. Encapsulation
2. Inheritance
3. Polymorphism
4. Abstraction

---

### 39. What is a class in Java?
**Answer:** A class is a blueprint or template used to create objects.
Example:
```class Car {
    String color;
    void drive() {
        System.out.println("Car is moving");
    }
}
```

---

### 40. What is an object?
**Answer:** An object is an instance of a class.
It represents a real-world entity.
Example:
```Car c1 = new Car();
```

---

### 41. What is the difference between a class and an object?
**Answer:** Class
			Object
			Blueprint
			Instance of class
			Logical entity
			Physical entity
			Example: Car
			Example: BMW, Audi

---

### 42. What is a constructor?
**Answer:** A constructor is a special method used to initialize objects.
It has the same name as the class and no return type.
Example:
```class Student {
    Student() {
        System.out.println("Constructor called");
    }
}
```

---

### 43. What is the "this" keyword?
**Answer:** this refers to the current object of the class.
Example:
```class Student {
    int id;

    Student(int id) {
        this.id = id;
    }
}
```

---

### 44. What is method overloading?
**Answer:** Method overloading means multiple methods with the same name but different parameters.
Example:
```void add(int a, int b) {}
void add(int a, int b, int c) {}
```

---

### 45. What is encapsulation?
**Answer:** Encapsulation means wrapping data (variables) and methods into a single unit (class) and restricting direct access.

---

### 46. Why do we use private variables in Java?
**Answer:** Private variables:
- Protect data
- Prevent direct access
- Improve security

---

### 47. What are getter and setter methods?
**Answer:** They are methods used to access and update private variables.
Example:
```class Student {
    private int age;

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

---

### 48. How does encapsulation improve security?
**Answer:** Encapsulation hides data and allows access only through controlled methods (getters/setters).
This prevents unauthorised modification of data.

---

### 49. What is inheritance?
**Answer:** Inheritance allows one class to acquire properties and methods of another class.
Example:
```class Animal {
    void eat() {
        System.out.println("Eating");
    }
}

class Dog extends Animal {}
```

---

### 50. What is the purpose of inheritance?
**Answer:** - Code reusability
- Reduces code duplication
- Improves maintainability

---

### 51. What is the super keyword?
**Answer:** super is used to refer to the parent class.
Example:
```super.methodName();
```

---

### 52. What is method overriding?
**Answer:** Method overriding means a child class provides its own implementation of a parent class method.
Example:
```class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}

class Dog extends Animal {
    void sound() {
        System.out.println("Dog barking");
    }
}
```

---

### 53. What are the types of inheritance in Java?
**Answer:** 1. Single Inheritance
2. Multilevel Inheritance
3. Hierarchical Inheritance
(Note: Multiple inheritance is not supported with classes, but possible using interfaces.)

---

### 54. What is polymorphism?
**Answer:** Polymorphism means one method having many forms.
Example:
- Method Overloading
- Method Overriding

---

### 55. What are the types of polymorphism?
**Answer:** 1. Compile-time polymorphism (Method Overloading)
2. Runtime polymorphism (Method Overriding)

---

### 56. What is compile-time polymorphism?
**Answer:** It occurs when the method call is resolved during compilation.
Example: Method Overloading

---

### 57. What is runtime polymorphism?
**Answer:** It occurs when the method call is resolved during runtime.
Example: Method Overriding

---

### 58. Difference between method overloading and method overriding
**Answer:** Method Overloading
			Method Overriding
			Same method name
			Same method name
			Different parameters
			Same parameters
			Same class
			Parent & child class
			Compile time
			Runtime

---

### 59. What is abstraction?
**Answer:** Abstraction means hiding implementation details and showing only essential features.
Example:
When you drive a car, you use steering and pedals, but you don’t see the internal engine working.

---

### 60. Difference between abstract class and interface
**Answer:** Abstract Class
			Interface
			Can have abstract & normal methods
			Mostly abstract methods
			Can have constructors
			Cannot have constructors
			Uses extends
			Uses implements

---

### 61. Can an abstract class have a constructor?
**Answer:** Yes.
An abstract class can have a constructor, which is called when a subclass object is created.

---

### 62. Can an interface have methods with body?
**Answer:** Yes (Java 8+).
Interfaces can have default and static methods with body.
Example:
```default void show() {
    System.out.println("Hello");
}
```

---

### 63. Why do we use abstraction?
**Answer:** Abstraction helps to:
- Hide complex implementation
- Reduce code complexity
- Improve security

---

### 64. What is the final keyword in Java?
**Answer:** final means cannot be changed.
Types:
1. final variable → value cannot change
2. final method → cannot be overridden
3. final class → cannot be inherited
Example:
```final int x = 10;
```

---

### 65. [PRACTICAL] Abstraction
**Answer:** Create an abstract class Shape with method area().
Create subclasses Circle and Rectangle that implement it.

---

### 66. [PRACTICAL] Inheritance
**Answer:** Create a class Animal with a method sound().
Create a class Dog that inherits Animal and overrides sound().

---

### 67. [PRACTICAL] Polymorphism
**Answer:** Create a class Calculator with add() method that works with:
1. two integers
2. three integers
3. two doubles

---

### 68. [PRACTICAL] Encapsulation
**Answer:** Create a class Student with private variables name and age.
Use getter and setter methods to access them.

---


## Module 4

### 69. What is the purpose of #include<stdio.h> ?
**Answer:** stdio.h is a header file that contains functions for input and output operations like printf() and scanf().

---

### 70. What is the main() function in C?
**Answer:** main() is the starting point of every C program. The program execution begins from this function.
Example:
```int main() {
    printf("Hello");
    return 0;
}
```

---

### 71. What are keywords in C?
**Answer:** Keywords are reserved words that have a special meaning in C and cannot be used as variable names.
Examples:
int, float, if, else, while, return

---

### 72. What are variables in C?
**Answer:** Variables are named memory locations used to store data values in a program.
Example:
```int age = 20;
```

---

### 73. What are primitive (basic) data types in C?
**Answer:** Primitive data types store basic values.
Examples:
- int
- float
- double
- char

---

### 74. What are derived (non-primitive) data types in C?
**Answer:** Derived data types are created from basic data types.
Examples:
- Arrays
- Pointers
- Structures
- Unions

---

### 75. What is the difference between int , float , and double ?
**Answer:** Data Type
			Description
			Example
			int
			Stores integers
			10
			float
			Stores decimal numbers (single precision)
			3.14
			double
			Stores larger decimal numbers (double precision)
			3.141592

---

### 76. What is type casting?
**Answer:** Type casting is converting one data type into another.
Example:
```float a = 5.6;
int b = (int)a;
```

---

### 77. What are operators in C?
**Answer:** Operators are symbols used to perform operations on variables and values.
Example:
- + - * /

---

### 78. What are the types of operators in C?
**Answer:** - Arithmetic operators
- Relational operators
- Logical operators
- Assignment operators
- Increment/Decrement operators
- Bitwise operators

---

### 79. What is the difference between ++i and i++ ?
**Answer:** Operator
			Meaning
			++i
			Pre-increment (value increases first)
			i++
			Post-increment (value increases after use)
Example:
```int i = 5;
++i; // becomes 6 immediately
```

---

### 80. What is the use of sizeof() operator?
**Answer:** sizeof() is used to find the size of a data type or variable in bytes.
Example:
```sizeof(int)
```

---

### 81. What is a conditional statement?
**Answer:** A conditional statement is used to make decisions in a program based on conditions.
Example:
if, if-else, switch

---

### 82. What is a conditional statement?
**Answer:** A conditional statement executes different code depending on whether a condition is true or false.

---

### 83. What is the difference between if and if-else ?
**Answer:** if
			if-else
			Executes code if condition is true
			Executes one block if true and another if false

---

### 84. What is an if-else ladder?
**Answer:** An if-else ladder is used to check multiple conditions sequentially.
Example:
```if (marks >= 90)
    printf("A");
else if (marks >= 75)
    printf("B");
else
    printf("C");
```

---

### 85. What is the switch statement?
**Answer:** switch is used to select one block of code from multiple options based on a variable value.
Example:
```switch(day) {
    case 1: printf("Monday"); break;
}
```

---

### 86. What is the difference between switch and if-else?
**Answer:** switch
			if-else
			Checks equality
			Can check multiple conditions
			Faster for many fixed cases
			More flexible

---

### 87. What are loops in C?
**Answer:** Loops are used to repeat a block of code multiple times.
Types:
- for
- while
- do while

---

### 88. What is the difference between for , while , and do-while loops?
**Answer:** Loop
			Condition Check
			for
			Before execution
			while
			Before execution
			do-while
			After execution (runs at least once)

---

### 89. What is an infinite loop?
**Answer:** An infinite loop is a loop that never ends because the condition always remains true.
Example:
```while(1){
    printf("Hello");
}
```

---

### 90. What is the use of break statement?
**Answer:** break is used to exit a loop or switch statement immediately.

---

### 91. What is the use of continue statement?
**Answer:** continueskips the current iteration and moves to the next iteration of the loop.

---

### 92. What is a function in C?
**Answer:** A function is a block of code that performs a specific task.
Example:
```void greet() {
    printf("Hello");
}
```

---

### 93. What are the types of functions in C?
**Answer:** 1. Library functions (e.g., printf, scanf)
2. User-defined functions
Based on parameters:
- No arguments, no return value
- Arguments, no return value
- No arguments, return value
- Arguments, return value

---

### 94. What is an array in C?
**Answer:** An array is a collection of elements of the same data type stored in contiguous memory locations.
Example:
```int arr[5];
```

---

### 95. What are the advantages of arrays?
**Answer:** - Store multiple values in one variable
- Easy data management
- Access elements using index
- Saves memory

---

### 96. What is the difference between 1D and 2D arrays?
**Answer:** 1D Array
			2D Array
			Single row
			Rows and columns
			Example: list
			Example: matrix
Example:
```int a[5];
int b[3][3];
```

---

### 97. What is a string in C?
**Answer:** A string is a sequence of characters stored in a character array and ending with \0 (null character).
Example:
```char name[] = "Nithin";
```

---

### 98. What is a pointer in C?
**Answer:** A pointer is a variable that stores the memory address of another variable.
Example:
```int a = 10;
int *p = &a;
```

---

### 99. What is the difference between pointer and array?
**Answer:** Pointer
			Array
			Stores address of a variable
			Stores collection of elements
			Can point to different locations
			Fixed memory size

---

### 100. What is dynamic memory allocation?
**Answer:** Dynamic memory allocation means allocating memory during runtime using functions like:
- malloc()
- calloc()
- realloc()
- free()
Example:
```int *p = (int*)malloc(5 * sizeof(int));
```

---

### 101. What is Object Oriented Programming (OOP)?
**Answer:** Object Oriented Programming is a programming paradigm that organizes code using objects and classes.
It helps in reusability, security, and easy maintenance of code.

---

### 102. What are the four pillars of OOP?
**Answer:** The four pillars of OOP are:
1. Encapsulation
2. Inheritance
3. Polymorphism
4. Abstraction

---

### 103. What is a class in Java?
**Answer:** A class is a blueprint or template used to create objects.
Example:
```class Car {
    String color;
    void drive() {
        System.out.println("Car is moving");
    }
}
```

---

### 104. What is an object?
**Answer:** An object is an instance of a class.
It represents a real-world entity.
Example:
```Car c1 = new Car();
```

---

### 105. What is the difference between a class and an object?
**Answer:** Class
			Object
			Blueprint
			Instance of class
			Logical entity
			Physical entity
			Example: Car
			Example: BMW, Audi

---

### 106. What is a constructor?
**Answer:** A constructor is a special method used to initialize objects.
It has the same name as the class and no return type.
Example:
```class Student {
    Student() {
        System.out.println("Constructor called");
    }
}
```

---

### 107. What is the "this" keyword?
**Answer:** this refers to the current object of the class.
Example:
```class Student {
    int id;

    Student(int id) {
        this.id = id;
    }
}
```

---

### 108. What is method overloading?
**Answer:** Method overloading means multiple methods with the same name but different parameters.
Example:
```void add(int a, int b) {}
void add(int a, int b, int c) {}
```

---

### 109. What is encapsulation?
**Answer:** Encapsulation means wrapping data (variables) and methods into a single unit (class) and restricting direct access.

---

### 110. Why do we use private variables in Java?
**Answer:** Private variables:
- Protect data
- Prevent direct access
- Improve security

---

### 111. What are getter and setter methods?
**Answer:** They are methods used to access and update private variables.
Example:
```class Student {
    private int age;

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

---

### 112. How does encapsulation improve security?
**Answer:** Encapsulation hides data and allows access only through controlled methods (getters/setters).
This prevents unauthorised modification of data.

---

### 113. What is inheritance?
**Answer:** Inheritance allows one class to acquire properties and methods of another class.
Example:
```class Animal {
    void eat() {
        System.out.println("Eating");
    }
}

class Dog extends Animal {}
```

---

### 114. What is the purpose of inheritance?
**Answer:** - Code reusability
- Reduces code duplication
- Improves maintainability

---

### 115. What is the super keyword?
**Answer:** super is used to refer to the parent class.
Example:
```super.methodName();
```

---

### 116. What is method overriding?
**Answer:** Method overriding means a child class provides its own implementation of a parent class method.
Example:
```class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}

class Dog extends Animal {
    void sound() {
        System.out.println("Dog barking");
    }
}
```

---

### 117. What are the types of inheritance in Java?
**Answer:** 1. Single Inheritance
2. Multilevel Inheritance
3. Hierarchical Inheritance
(Note: Multiple inheritance is not supported with classes, but possible using interfaces.)

---

### 118. What is polymorphism?
**Answer:** Polymorphism means one method having many forms.
Example:
- Method Overloading
- Method Overriding

---

### 119. What are the types of polymorphism?
**Answer:** 1. Compile-time polymorphism (Method Overloading)
2. Runtime polymorphism (Method Overriding)

---

### 120. What is compile-time polymorphism?
**Answer:** It occurs when the method call is resolved during compilation.
Example: Method Overloading

---

### 121. What is runtime polymorphism?
**Answer:** It occurs when the method call is resolved during runtime.
Example: Method Overriding

---

### 122. Difference between method overloading and method overriding
**Answer:** Method Overloading
			Method Overriding
			Same method name
			Same method name
			Different parameters
			Same parameters
			Same class
			Parent & child class
			Compile time
			Runtime

---

### 123. What is abstraction?
**Answer:** Abstraction means hiding implementation details and showing only essential features.
Example:
When you drive a car, you use steering and pedals, but you don’t see the internal engine working.

---

### 124. Difference between abstract class and interface
**Answer:** Abstract Class
			Interface
			Can have abstract & normal methods
			Mostly abstract methods
			Can have constructors
			Cannot have constructors
			Uses extends
			Uses implements

---

### 125. Can an abstract class have a constructor?
**Answer:** Yes.
An abstract class can have a constructor, which is called when a subclass object is created.

---

### 126. Can an interface have methods with body?
**Answer:** Yes (Java 8+).
Interfaces can have default and static methods with body.
Example:
```default void show() {
    System.out.println("Hello");
}
```

---

### 127. Why do we use abstraction?
**Answer:** Abstraction helps to:
- Hide complex implementation
- Reduce code complexity
- Improve security

---

### 128. What is the final keyword in Java?
**Answer:** final means cannot be changed.
Types:
1. final variable → value cannot change
2. final method → cannot be overridden
3. final class → cannot be inherited
Example:
```final int x = 10;
```

---

### 129. [PRACTICAL] Abstraction
**Answer:** Create an abstract class Shape with method area().
Create subclasses Circle and Rectangle that implement it.

---

### 130. [PRACTICAL] Inheritance
**Answer:** Create a class Animal with a method sound().
Create a class Dog that inherits Animal and overrides sound().

---

### 131. [PRACTICAL] Polymorphism
**Answer:** Create a class Calculator with add() method that works with:
1. two integers
2. three integers
3. two doubles

---

### 132. [PRACTICAL] Encapsulation
**Answer:** Create a class Student with private variables name and age.
Use getter and setter methods to access them.

---

