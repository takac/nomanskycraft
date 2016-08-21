'use strict'

function canMake (item, inventory, quantity) {
    if (typeof quantity === 'undefined') {
        quantity = 1;
    }
    var items = getAllItems();
    var howToMake = {};
    if (inventory.hasOwnProperty(item) && items[item].hasOwnProperty('recipe')) {
        if (inventory[item] >= quantity) {
            howToMake[item] = quantity;
            return howToMake;
        } else {
            quantity = quantity - inventory[item];
            howToMake[item] = inventory[item];
        }
    }
    if (!items[item].hasOwnProperty('recipe')) {
        var currentQuant = inventory[item];
        if (currentQuant >= quantity) {
            howToMake[item] = quantity;
            return howToMake;
        } else {
            return;
        }
    }
    for (var recipeItem in items[item].recipe) {
        var q = items[item].recipe[recipeItem];
        var out = canMake(recipeItem, inventory, q);
        if (typeof out === 'undefined') {
            return;
        } else {
            if (out.hasOwnProperty(recipeItem)) {
                howToMake[recipeItem] = out[recipeItem]
            } else {
                howToMake[recipeItem] = out
            }
        }
    }
    return howToMake;
}

function getItemImagePath (item) {
    var base = '/images/items/200px-';
    return base + item.replace(/ /g, '-').toLowerCase() + '.png';
}

function itemRequireForRecipes (item) {
    var requiredFor = [];
    var items = getAllItems();
    for (var i in items) {
        if (items[i].hasOwnProperty('recipe')) {
            if (items[i]['recipe'].hasOwnProperty(item)) {
                requiredFor.push(i);
            }
        }
    }
    return requiredFor;
}

function itemFromLink (ref) {
    var all = getAllItems()
    return Object.keys(all).filter(
        function (item) {
            return all[item].ref === ref;
        })[0];
}

function itemToLink (item) {
    return '#' + getAllItems()[item]['ref'];
}

function getInventory (item) {
    var inv = getAllInventory();
    var quant = inv[item];
    if (typeof quant === 'undefined') {
        return 0;
    }
    return parseInt(inv[item]);
}

function setInventory (item, quant) {
    var inv = getAllInventory();
    quant = parseInt(quant);
    if (quant === 0) {
        delete inv[item];
    } else {
        inv[item] = parseInt(quant);
    }
    window.localStorage.setItem('inventory', JSON.stringify(inv));
    renderInventory();
    renderCraftingTable();
}

function getAllInventory () {
    var inv = window.localStorage.getItem('inventory');
    if (inv == null) {
        inv = {}
        window.localStorage.setItem('inventory', JSON.stringify(inv));
    } else {
        inv = JSON.parse(inv);
    }
    return inv;
}

function renderInventory () {
    var tbody = $('#inventory tbody');
    var inv = getAllInventory();
    tbody.empty();
    for (var i in inv) {
        var quant = inv[i];
        tbody.append(createInventoryRow(i, quant, getPrice(i)));
    }
    window.localStorage.setItem('inventory', JSON.stringify(inv));
    updateTotal();
}

function createInventoryRow (item, quantity, price) {
    return $('<tr>').append(
        $('<td>').addClass('noborder').append(
            $('<button>').addClass('remove')
            .click(function () {
                $(this).parents('tr').remove();
                setInventory(item, 0);
            }).html('&#10006;')
        ),
        $('<td>').append(
            $('<span>').addClass('name').text(item).click(function () { updateInfo(item) })
        ),
        $('<td>').append(
            $('<img>').attr('src', getItemImagePath(item))
        ),
        $('<td>').addClass('quantity').text(quantity),
        $('<td>').addClass('price').text((quantity * price).toMoney())
    )
}

// fetch item price and recipe obj
function getItem (item) {
    var items = getAllItems();
    return items[item];
}

function getAllItems () {
    return window.items;
}

function getRecipe (item) {
    var items = getAllItems();
    return items[item].recipe;
}

function getMetadata (item) {
    var items = getAllItems();
    var meta = {};
    var category = items[item]['category'];
    var type = items[item]['category'];
    if (typeof category !== 'undefined') {
        meta['category'] = category;
    }
    if (typeof type !== 'undefined') {
        meta['type'] = type;
    }
    return meta;
}

function getPrice (item) {
    var items = getAllItems();
    return parseFloat(items[item].price);
}

function updateTotal () {
    var total = 0;
    var inv = getAllInventory();
    for (var item in inv) {
        total += getPrice(item) * inv[item];
    }
    $('#total').text(total.toMoney());
}

// Recreate crafting table
function renderCraftingTable () {
    var inv = getAllInventory();
    var tbody = $('#canmake tbody');
    tbody.find('tr').remove();
    for (var item in getAllItems()) {
        if (getItem(item).hasOwnProperty('recipe')) {
            var tmpInv = jQuery.extend({}, inv)
            delete tmpInv[item]
            var made = canMake(item, tmpInv);
            if (!(typeof made === 'undefined') && !made.hasOwnProperty(item)) {
                tbody.append(createCraftingRow(item));
            }
        }
    }
}

function renderRecipe (item, recipe) {
    if (typeof recipe === 'undefined') {
        recipe = getRecipe(item);
    }
    return Object.keys(recipe).map(function (i) {
        return $('<span>')
            // .addClass('breakline')
            .append(
                $('<span>').addClass('name').text(i).click(function () {
                    updateInfo(i);
                }), ' x' + recipe[i]
            )
    });
}

function createCraftingRow (item) {
    return $('<tr>').append(
        $('<td>').addClass('name').text(item),
        $('<td>').addClass('price').text(getPrice(item).toMoney()),
        $('<td>').addClass('recipe').html(renderRecipe(item)),
        $('<td>').append(
            $('<button>').text('Craft').click(function () {
                craftItemFromInventory(item);
            })
    ))
}

function craftItemFromInventory (item) {
    var inv = getAllInventory();
    delete inv[item];
    var recipe = canMake(item, inv);
    removeFromInventory(recipe);
    setInventory(item, getInventory(item) + 1);
}

// function clearInventory () {
//     window.localStorage.removeItem('inventory');
// }

function removeFromInventory (recipe) {
    for (var recipeItem in recipe) {
        if (typeof recipe[recipeItem] === 'object') {
            removeFromInventory(recipe[recipeItem]);
        } else {
            var newQuant = getInventory(recipeItem) - parseInt(recipe[recipeItem]);
            setInventory(recipeItem, newQuant);
        }
    }
}

function populateQuickAdd (items) {
    var quicklist = $('#quicklist');
    quicklist.empty();
    $.each(items, function (idx, item) {
        quicklist.append(
            $('<li>').addClass('quick')
            .append($('<img>').attr('src', getItemImagePath(item)))
            .append($('<span>').text(item))
            .click(function () {
                updateInfo(item);
            })
        );
    });
}

function updateInfo (item) {
    var infoDiv = $('#info');
    // Don't update if we don't have to
    if (infoDiv.find(itemToLink(item)).length > 0) {
        return;
    }
    infoDiv.empty();
    var info = infoDiv.append($('<div>').attr('id', itemToLink(item).slice(1)));
    var metadata = getMetadata(item);
    var requiredFor = itemRequireForRecipes(item);
    info.append(
        $('<h4>').text(item),
        $('<div>').append(
            $('<img>').attr('src', getItemImagePath(item))
        ),
        $('<div>').append(
            $('<span>').addClass('info').text('Price'),
            $('<input>', {'type': 'number', 'step': 0.01}).val(getPrice(item))
                .change(function () {
                    var newPrice = parseFloat($(this).val());
                    window.items[item].price = newPrice;
                    renderInventory();
                })
        )
    );

    for (var meta in metadata) {
        info.append(
            $('<div>').append(
                $('<span>').addClass('info').text(meta.titleize()),
                $('<span>').text(metadata[meta].titleize())
            )
        )
    }

    if (requiredFor.length > 0) {
        var requiredHtml = requiredFor.map(function (reqItem) {
            return $('<span>').append(
                    $('<span>').addClass('name')
                .text(reqItem)
                .click(function () {
                    updateInfo(reqItem);
                }), ' '
            );
        });
        info.append(
            $('<div>').append(
                $('<span>').addClass('info').text('Required For'),
                $('<span>').append(requiredHtml)
            )
        );
    }

    if (getRecipe(item)) {
        info.append(
            $('<div>').append(
                $('<span>').addClass('info').text('Recipe'),
                $('<span>').html(renderRecipe(item))
            )
        );
    }

    info.append(
        $('<div>').attr('id', 'add').append(
            $('<input>', {'type': 'button', 'value': 'Add'})
            .click(
                function () {
                    var inputQuant = parseInt($('#addqaunt').val());
                    var quant = getInventory(item) + inputQuant;
                    setInventory(item, quant)
                }),
            $('<input>', {'id': 'addqaunt', 'type': 'number', 'value': '10', 'step': 1})
        )
    )
    window.localStorage.setItem('focusedItem', item);
    window.location.href = itemToLink(item)
}

window.onpopstate = function (event) {
    var hash = document.location.hash
    if (hash.length > 0) {
        updateInfo(itemFromLink(hash.slice(1)));
    }
}

function setupAutocomplete () {
    $('#inventoryitem').keyup(function () {
        var val = $(this).val();
        var matched = Object.keys(getAllItems()).filter(function (item) {
            var re = new RegExp(val, 'i');
            return re.test(item);
        });
        populateQuickAdd(matched);
    });
}

function loadStorage () {
    renderInventory();
    renderCraftingTable();
    var focusedItem = window.localStorage.getItem('focusedItem');
    if (focusedItem !== null) {
        updateInfo(focusedItem);
    }
}

$(function () {
    $.getJSON('/base.json', function (items) {
        window.items = items;
        populateQuickAdd(Object.keys(items));
        setupAutocomplete();
        loadStorage();
    })
});
