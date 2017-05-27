const assert = require('assert');

// http://codekata.com/kata/kata02-karate-chop/

// Play around w/ as many implementations as you can.

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
    when(list.length === 0, cbs);


const mid_index_of = (list) =>
    Math.floor(list.length / 2);


const mid_val_of = (list) =>
    list[mid_index_of(list)];


const left_of_mid = (list) =>
    list.slice(0, mid_index_of(list));


const right_of_mid = (list) =>
    list.slice(mid_index_of(list) + 1);


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
    console.log('IMPERATIVE implementation');
    tests(chop_imp);

    console.log('IMPERATIVE implementation');
    tests(chop_func);

    console.log('OOP implementation 1');
    tests(chop_oop_1);

    console.log('OOP implementation 2');
    tests(chop_oop_2);

    console.log('SUCCESS!!');
} catch(e) {
    console.log('FAILED!!');
    console.error(e.message);
}
console.log('END');
