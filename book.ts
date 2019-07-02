export default class Book {

    id: number;
    ISBN: string;
    available: boolean;

    constructor(id: number, ISBN: string, available: boolean) {
        this.id = id;
        this.ISBN = ISBN;
        this.available = available;
    }

}