const assert = require('assert');

// http://codekata.com/kata/kata02-karate-chop/

// Play around w/ as many implementations as you can.
// Some of this is too much for the problem, but that's not the point of the exercise.
// Instead we are exploring and playing around with new techniques and constraints.


// STANDARD IMPERATIVE VERSION //////////////////////////////////

function chop_imp(num, list) {
    if (list.length === 0) {
        return -1;
    }
    let l, r, h, val, idx = -1;

    l = 0;
    r = list.length - 1;
    h = Math.floor((r - l) / 2);

    while (l <= r) {
        val = list[h];
        if (num === val) {
            return h;
        } else if (num > val) {
            l = h + 1;
        } else {
            r = h - 1;
        }
        h = Math.floor((r - l) / 2) + l;
    }

    return idx;
}


// FUNCTION STYLE //////////////////////////////////////////////

const chop_func = (num, list, offset = 0) =>
    when_empty(list, {
        isTrue: num_not_found,
        isFalse: () =>
            find_num(
                num, list, offset
            )
    });


const num_not_found = () => -1;


const find_num = (num, list, offset = 0) =>
    when(num === mid_val_of(list), {
        isTrue: () => mid_index_of(list) + offset,
        isFalse: () => split_that_includes(num, list, offset)
    });


const split_that_includes = (num, list, offset = 0) =>
    when(num > mid_val_of(list), {
        isTrue: () => chop_func(num, right_of_mid(list), mid_index_of(list) + 1 + offset),
        isFalse: () => chop_func(num, left_of_mid(list), offset)
    });


// UTILS

const when = (predicate, cbs) =>
    predicate
        ? cbs.isTrue()
        : cbs.isFalse();


const when_empty = (list, cbs) =>
    when(len(list) === 0, cbs);


const mid_index_of = (list) =>
    Math.floor(len(list) / 2);


const mid_val_of = (list) =>
    list[mid_index_of(list)];


const left_of_mid = (list) =>
    list.slice(0, mid_index_of(list));


const right_of_mid = (list) =>
    list.slice(mid_index_of(list) + 1);


const is_num_in_middle = (num, list) =>
    mid_val_of(list) === num;


const is_num_on_the_right = (num, list) =>
    num > mid_val_of(list);


const len = (list) =>
    list.length;


const case_of = (datatype, cases) =>
    datatype.caseOf(cases);


// FUNCTION STYLE (ADT) ///////////////////////////////////


const chop_func_adt = (num, list, offset = 0) =>
    case_of(bin_search(num, list, offset), {
        None: () => -1,
        Just: index => index,
    });

const bin_search = (num, list, offset) => {
    if (len(list) === 0) {
        return Maybe.None()
    }
    else if (is_num_in_middle(num, list)) {
        return Maybe.Just(mid_index_of(list) + offset);
    }
    else if (is_num_on_the_right(num, list)) {
        return bin_search(num, right_of_mid(list), offset + mid_index_of(list) + 1);
    }
    else {
        return bin_search(num, left_of_mid(list), offset);
    }
};


const Maybe = {
    Just: (val) =>
        ({
            caseOf: ({Just}) => Just(val)
        }),


    None: () =>
        ({
            caseOf: ({None}) => None()
        })
};


const chop_func_adt_2 = (num, list, start = 0) =>
    case_of(locate(num, list, start), {
        None: () => -1,
        Found: index => index,
        List: (slice_list, slice_start) => chop_func_adt_2(num, slice_list, slice_start)
    });


const locate = (num, list, start) => {
    if (len(list) === 0) {
        return Location.None();
    }
    else if (is_num_in_middle(num, list)) {
        return Location.Found(mid_index_of(list) + start);
    }
    else if (is_num_on_the_right(num, list)) {
        return Location.List(right_of_mid(list), start + mid_index_of(list) + 1);
    }
    else {
        return Location.List(left_of_mid(list), start);
    }
};


const Location = {
    None: () =>
        ({
            caseOf: ({None})=> None()
        }),

    Found: (index) =>
        ({
            caseOf: ({Found}) => Found(index)
        }),

    List: (list, start) =>
        ({
            caseOf: ({List}) => List(list, start)
        })
};


// OOP STYLE //////////////////////////////////////////////

class Index {
    constructor(num) {
        this._num = num;
    }
    val() {
        return this._num;
    }
    static thatsEmpty() {
        return new Index(-1);
    }
}


class IndexedListUsingBinSearch {
    constructor(list) {
        this._list = list;
    }
    indexOf(num) {
        if (this._list.empty())
            return Index.thatsEmpty();

        return this._list.valAtMidEqualTo(num)
            ? new Index(this._list.mid())
            : this._split(num).indexOf(num);
    }
    _split(num) {
        return new IndexedListUsingBinSearch(
            this._list.splitThatIncludes(num)
        );
    }
}


class ComparableSlicedList {
    constructor(list, start = 0) {
        this._list = list;
        this._start = start;
    }
    mid() {
        return this._half() + this._start;
    }
    valAtMidEqualTo(num) {
        return this._list[this._half()] === num;
    }
    splitThatIncludes(num) {
        return num > this._list[this._half()]
            ? new ComparableSlicedList(this._sliceRightHalf(), this.mid() + 1)
            : new ComparableSlicedList(this._sliceLeftHalf(), this._start);
    }
    empty() {
        return this._list.length === 0;
    }
    _half() {
        return Math.floor(this._list.length / 2);
    }
    _sliceLeftHalf() {
        return this._list.slice(0, this._half());
    }
    _sliceRightHalf() {
        return this._list.slice(this._half() + 1);
    }
}


class ComparableCursoredList {
    constructor(list) {
        this._list = list;
    }
    mid() {
        return this._list.mid();
    }
    valAtMidEqualTo(num) {
        return this._list.valAtMid() === num;
    }
    splitThatIncludes(num) {
        return num > this._list.valAtMid()
            ? new ComparableCursoredList(this._list.rightOfMid())
            : new ComparableCursoredList(this._list.leftOfMid());
    }
    empty() {
        return this._list.empty();
    }
}


class CursoredList {
    constructor(list, left = 0, right = list.length - 1) {
        this._list = list;
        this._left = left;
        this._right = right;
    }
    leftOfMid() {
        return new CursoredList(
            this._list,
            this._left,
            this.mid() - 1
        );
    }
    rightOfMid() {
        return new CursoredList(
            this._list,
            this.mid() + 1,
            this._right
        );
    }
    empty() {
        return this._list.length === 0 || this._left > this._right;
    }
    valAtMid() {
        return this._list[this.mid()];
    }
    mid() {
        return Math.floor((this._right - this._left) / 2) + this._left;
    }
}


function chop_oop_1(num, list) {
    const _list = new IndexedListUsingBinSearch(
        new ComparableCursoredList(
            new CursoredList(list)
        )
    );
    return _list.indexOf(num).val();
}


function chop_oop_2(num, list) {
    const _list = new IndexedListUsingBinSearch(
        new ComparableSlicedList(list)
    );
    return _list.indexOf(num).val();
}


// MAIN //////////////////////////////////////////////

function tests(chop) {
    assert.equal(-1, chop(3, []))
    assert.equal(-1, chop(3, [1]))
    assert.equal(0,  chop(1, [1]))

    assert.equal(0,  chop(1, [1, 3, 5]))
    assert.equal(1,  chop(3, [1, 3, 5]))
    assert.equal(2,  chop(5, [1, 3, 5]))
    assert.equal(-1, chop(0, [1, 3, 5]))
    assert.equal(-1, chop(2, [1, 3, 5]))
    assert.equal(-1, chop(4, [1, 3, 5]))
    assert.equal(-1, chop(6, [1, 3, 5]))

    assert.equal(0,  chop(1, [1, 3, 5, 7]))
    assert.equal(1,  chop(3, [1, 3, 5, 7]))
    assert.equal(2,  chop(5, [1, 3, 5, 7]))
    assert.equal(3,  chop(7, [1, 3, 5, 7]))
    assert.equal(-1, chop(0, [1, 3, 5, 7]))
    assert.equal(-1, chop(2, [1, 3, 5, 7]))
    assert.equal(-1, chop(4, [1, 3, 5, 7]))
    assert.equal(-1, chop(6, [1, 3, 5, 7]))
    assert.equal(-1, chop(8, [1, 3, 5, 7]))
}


console.log('BEGIN tests...')
try {
    const implementations = {
        chop_imp,
        chop_func,
        chop_func_adt,
        chop_func_adt_2,
        chop_oop_1,
        chop_oop_2,
    };

    Object.keys(implementations).forEach((key) => {
        console.log(`${key} running tests`);
        tests(implementations[key]);
        console.log(`${key} has passed!\n`);
    });

    console.log('SUCCESS!!');

} catch(e) {
    console.log('FAILED!!');
    console.error(e.message);
}
console.log('END');
