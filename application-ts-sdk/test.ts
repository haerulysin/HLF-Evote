class Animal{
    name:string;
    constructor(name:string){
        this.name = name;
    }
}


class Dog extends Animal{
    age:number;
    constructor(name:string,age:number){
        super(name);
        this.age = age;
    }
}

function main(){

    const animal = new Dog("Anjing",33);
    return animal;
}


console.log(main())