export default class Book {

    id: number;
    ISBN: string;
    title: string;

    constructor(id: number, ISBN: string, title: string) {
        this.id = id;
        this.ISBN = ISBN;
        this.title = title;
    }

}