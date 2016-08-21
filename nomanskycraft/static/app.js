"use strict";

function can_make(item, inventory, quantity) {
    if (typeof quantity === "undefined") {
        quantity = 1;
    }
    var items = get_all_items();
    var how_to_make = {};
    if (inventory.hasOwnProperty(item) && items[item].hasOwnProperty("recipe")) {
        if(inventory[item] >= quantity) {
            how_to_make[item] = quantity;
            return how_to_make;
        }
        else {
            quantity = quantity - inventory[item];
            how_to_make[item] = inventory[item];
        }
    }
    if (!items[item].hasOwnProperty("recipe")) {
        var current_quant = inventory[item];
        if ( current_quant >= quantity ) {
            how_to_make[item] = quantity;
            return how_to_make;
        }
        else {
            return;
        }
    }
    for (var recipe_item in items[item].recipe) {
        var q = items[item].recipe[recipe_item];
        var out = can_make(recipe_item, inventory, q);
        if ( typeof out ===  "undefined" ) {
            return;
        } else {
            if ( out.hasOwnProperty(recipe_item) ){
                how_to_make[recipe_item] = out[recipe_item]
            }
            else {
                how_to_make[recipe_item] = out
            }
        }
    }
    return how_to_make;
}

function get_item_image_path(item) {
    var base = "/static/images/items/200px-";
    return base + item.replace(/ /g, "-").toLowerCase() + ".png";
}

function item_require_for_recipes(item) {
    var required_for = [];
    for (var i in items) {
        if ( items[i].hasOwnProperty('recipe') ) {
            if ( items[i]['recipe'].hasOwnProperty(item) ) {
                required_for.push(i);
            }
        }
    }
    return required_for;
}

function item_from_link(ref) {
    var all = get_all_items()
    return Object.keys(all).filter(
        function(item) {
            return all[item].ref === ref;
        })[0];
}

function item_to_link(item) {
    return "#" + get_all_items()[item]['ref'];
}

function get_inventory(item) {
    var inv = get_all_inventory();
    var quant = inv[item];
    if(typeof quant === "undefined") {
        return 0;
    }
    return parseInt(inv[item]);
}

function set_inventory(item, quant) {
    var inv = get_all_inventory();
    inv[item] = parseInt(quant);
    localStorage.setItem('inventory', JSON.stringify(inv));
    render_inventory();
    render_crafting_table();
}

function get_all_inventory() {
    var inv = localStorage.getItem('inventory');
    if (inv == null) {
        inv = {}
        localStorage.setItem('inventory', JSON.stringify(inv));
    } else {
        inv = JSON.parse(inv);
    }
    console.log("retrieve inv")
    console.log(inv)
    return inv;
}

function render_inventory() {
    var tbody = $("#inventory tbody");
    var inv = get_all_inventory();
    console.log("update inv")
    console.log(inv)
    tbody.empty();
    for (var i in inv) {
        var quant = inv[i];
        tbody.append(create_inventory_row(i, quant, get_price(i)));
    }
    console.log(inv);
    localStorage.setItem('inventory', JSON.stringify(inv));
    update_total();
}

function create_inventory_row(item, quantity, price) {
    return $('<tr>').append(
        $('<td>').addClass('noborder').append(
            $("<button>").addClass('remove')
            .click(function() {
                $(this).parents("tr").remove();
                set_inventory(item, 0);
            }).html("&#10006;")
        ),
        $('<td>').append(
            $("<span>").addClass('name').text(item).click(function() { update_info(item) })
        ),
        $('<td>').append(
            $("<img>").attr("src", get_item_image_path(item))
        ),
        $('<td>').addClass('quantity').text(quantity),
        $('<td>').addClass('price').text((quantity * price).toMoney())
    )
}

// fetch item price and recipe obj
function get_item(item) {
    var items = get_all_items();
    return items[item];
}

function get_all_items() {
    return window.items;
}

function get_recipe(item) {
    var items = get_all_items();
    return items[item].recipe;
}

function get_metadata(item) {
    var items = get_all_items();
    var meta = {};
    var category = items[item]['category'];
    var type = items[item]['category'];
    if(typeof category !== "undefined") {
        meta['category'] = category;
    }
    if(typeof type !== "undefined") {
        meta['type'] = type;
    }
    return meta;
}

function get_price(item) {
    var items = get_all_items();
    return parseFloat(items[item].price);
}

function update_total() {
    var total = 0;
    var inv = get_all_inventory();
    for (var item in inv) {
        total +=  get_price(item) * inv[item];
    }
    $("#total").text(total.toMoney());
}

// Recreate crafting table
function render_crafting_table() {
    var inv = get_all_inventory();
    var tbody = $("#canmake tbody");
    tbody.find("tr").remove();
    for (var item in get_all_items()) {
        if ( get_item(item).hasOwnProperty("recipe") ) {
            var tmp_inv = jQuery.extend({}, inv)
            delete tmp_inv[item]
            var made = can_make(item, tmp_inv);
            if (! (typeof made === "undefined") && ! made.hasOwnProperty(item) ) {
                tbody.append(create_crafting_row(item));
            }
        }
    }
}

function render_recipe(item, recipe) {
    if (typeof recipe === "undefined") {
        recipe = get_recipe(item);
    }
    return Object.keys(recipe).map(function(i) {
        return $("<span>")
            // .addClass('breakline')
            .append(
                $("<span>").addClass('name').text(i).click(function() {
                    update_info(i);
                }), " x"+recipe[i]
            )
    });
}

function create_crafting_row(item) {
    return $("<tr>").append(
        $("<td>").addClass('name').text(item),
        $('<td>').addClass('price').text(get_price(item).toMoney()),
        $('<td>').addClass('recipe').html(render_recipe(item)),
        $("<td>").append(
                $("<button>").text("Craft").click(function() {
                var item = $(this).parents("tr").find(".name").eq(0).text();
                craft_item_from_inventory(item);
            })
    ))
}

function craft_item_from_inventory(item) {
    var recipe = get_recipe(item);
    for ( var recipe_item in recipe ) {
        set_inventory(recipe_item, get_inventory(item)-parseInt(recipe[recipe_item]));
    }
    set_inventory(item, get_inventory(item)+1);
}

function find_items_with_tag(tag) {
    var items = get_all_items();
    var tagged = Object.keys(items).filter(function(item) {
        if (items[item].hasOwnProperty('tags')) {
            var tags = items[item]['tags'];
            if (tags.indexOf(tag) > -1) {
                return true;
            }
        }
    });
    return tagged;
}
function populate_quick_add(items) {
    var quicklist = $("#quicklist");
    quicklist.empty();
    $.each(items, function(idx, item) {
        quicklist.append(
            $("<li>").addClass("quick")
            .append($("<img>").attr("src", get_item_image_path(item)))
            .append($("<span>").text(item))
            .click(function() {
                update_info(item);
            })
        );
    });
}

function update_info(item) {
    var info_div = $("#info");
    // Don't update if we don't have to
    if (info_div.find(item_to_link(item)).length > 0) {
        return;
    }
    info_div.empty();
    var info = info_div.append($("<div>").attr('id', item_to_link(item).slice(1)));
    var metadata = get_metadata(item);
    var required_for = item_require_for_recipes(item);
    info.append(
        $("<h4>").text(item),
        $("<div>").append(
            $("<img>").attr("src", get_item_image_path(item))
        ),
        $("<div>").append(
            $("<span>").addClass('info').text("Price"),
            $("<input>", {'type': 'number', 'step': 0.01}).val(get_price(item))
                .change(function() {
                    var new_price = parseFloat($(this).val());
                    window.items[item].price = new_price;
                    render_inventory();
                })
        )
    );

    for (var meta in metadata) {
        info.append(
            $("<div>").append(
                $("<span>").addClass('info').text(meta.titleize()),
                $("<span>").text(metadata[meta].titleize())
            )
        )
    }

    if ( required_for.length > 0 ) {
        var required_html = required_for.map(function(req_item) {
            return $("<span>").append(
                    $("<span>").addClass('name')
                .text(req_item)
                .click(function() {
                    update_info(req_item);
                }), " "
            );
        });
        info.append(
            $("<div>").append(
                $("<span>").addClass('info').text("Required For"),
                $("<span>").append(required_html)
            )
        );
    }

    if ( get_recipe(item) ) {
        info.append(
            $("<div>").append(
                $("<span>").addClass('info').text("Recipe"),
                $("<span>").html(render_recipe(item))
            )
        );
    }

    info.append(
        $("<div>").attr('id', 'add').append(
            $("<input>", {'type': 'button', 'value': 'Add'})
            .click(
                function() {
                    var input_quant = parseInt($('#addqaunt').val());
                    var quant = get_inventory(item) + input_quant;
                    set_inventory(item, quant)
                }),
            $("<input>", {'id': 'addqaunt', 'type': 'number', 'value': '10', 'step': 1})
        )
    )
    localStorage.setItem('focused_item', item);
    window.location.href = item_to_link(item)
}

window.onpopstate = function(event) {
    var hash = document.location.hash
    if (hash.length > 0) {
        console.log("hash " + hash);
        update_info(item_from_link(hash.slice(1)));
    }
}

function setup_autocomplete() {
    $("#inventoryitem").keyup(function() {
        var val = $(this).val();
        var matched = Object.keys(get_all_items()).filter(function(item) {
            var re = new RegExp(val, "i");
            return re.test(item);
        });
        populate_quick_add(matched);
    });
}

function load_storage() {
    render_inventory();
    render_crafting_table();
    var focused_item = localStorage.getItem('focused_item');
    if (focused_item !== null) {
        update_info(focused_item);
    }
}

$(function () {
    $.getJSON( "/base.json", function(items) {
        window.items = items;
        populate_quick_add(Object.keys(items));
        setup_autocomplete();
        load_storage();
    })
});
