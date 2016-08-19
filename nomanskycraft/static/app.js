function can_make(item, items, inventory, quantity) {
    if (typeof quantity === "undefined") {
        quantity = 1;
    }
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
        out = can_make(recipe_item, items, inventory, q);
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

function populate_item_table(items) {
    $.each(items, function(item) {
        $("#items").find('tbody').append(
            $('<tr>').append(
                $('<td>').text(item),
                $('<td>').append(
                    $("<input>",
                        {type: "number", step:"0.01"})
                    .val(items[item].price)
                    .change(function() {
                        update_inventory(item, 0);
                        update_can_make();
                    })
                ),
                $('<td>').text(JSON.stringify(items[item].recipe))
            )
        )
    })
}

function inventory_table_inputs(items) {
    var select = $("#inventoryitem")
    $.each(items, function(item) {
        select.append($("<option></option>")
                        .attr("value", item)
                        .text(item)); 
    });
    $("#inventoryadd").click(function() {
        var item = $("#inventoryitem").val();
        var quant = $("#inventoryquantity").val();
        update_inventory(item, quant);
        update_can_make();

    });

}

function update_inventory(item, quantity) {
    var tbody = $("#inventory").find('tbody');
    var td = tbody.find("tr td:contains(" + item + ")");
    if (td.length == 1) {
        var q = $(td).siblings().eq(0);
        var new_quant = parseInt(q.text()) + parseInt(quantity);
        if (new_quant == 0) {
            td.parents("tr").remove();
        } else {
            q.text(new_quant);
        }
    } else if (quantity > 0) {
        tbody.append(create_inventory_row(item, quantity, get_price(item)));
    }
    update_total()
}

function create_inventory_row(item, quantity, price) {
    return $('<tr>').append(
        $('<td>').text(item),
        $('<td>').text(quantity),
        $('<td>').text(quantity * price),
        $('<td>').append(
            $("<button>").click(function() {
                $(this).parents("tr").remove()
            }).text("Remove")
        )
    )
}

// fetch item price and recipe obj
function get_item(item) {
    var items = get_all_items();
    return items[item];
}

// Translate item table into object
function get_all_items() {
    var items = {};
    $("#items").find('tbody tr').each(function(idx, tr) {
        var tds = $(tr).find("td");
        var item = {"price": tds.eq(1).find("input").val()};
        var recipe = tds.eq(2).text();
        if ( recipe !== "" ) {
            item["recipe"] = JSON.parse(tds.eq(2).text())
        }
        items[tds.eq(0).text()] = item;
    });
    return items;
}

function get_recipe(item) {
    var items = get_all_items();
    return items[item].recipe;
}

function get_price(item) {
    var items = get_all_items();
    return items[item].price;
}

function update_total() {
    var total = 0;
    var inv = get_inventory();
    for (var item in inv) {
        total +=  get_price(item) * inv[item];
    }
    $("#total").text(total);
}

// Translate inventory table to obj
function get_inventory() {
    var trs = $("#inventory").find('tbody tr');
    var inv = {};
    $.each(trs, function() {
        var tds = $(this).find("td");
        inv[$(tds.get(0)).text()] = parseInt($(tds.get(1)).text());
    });
    return inv;
}

// Recreate crafting table
function update_can_make() {
    var inv = get_inventory();
    var tbody = $("#canmake tbody");
    tbody.find("tr").remove();
    for (var item in get_all_items()) {
        if ( get_item(item).hasOwnProperty("recipe") ) {
            var tmp_inv = jQuery.extend({}, inv)
            delete tmp_inv[item]
            made = can_make(item, get_all_items(), tmp_inv);
            if (! (typeof made === "undefined") && ! made.hasOwnProperty(item) ) {
                tbody.append(create_crafting_row(item));
            }
        }
    }
}

function create_crafting_row(item) {
    return $("<tr>").append(
        $("<td>").text(item),
        $('<td>').text(get_price(item)),
        $('<td>').text(JSON.stringify(get_recipe(item))),
        $("<td>").append(
                $("<button>").text("Craft").click(function() {
                var item = $(this).parents("tr").find("td").eq(0).text();
                craft_item_from_inventory(item);
            })
    ))
}

function craft_item_from_inventory(item) {
    var recipe = get_recipe(item);
    for ( var recipe_item in recipe ) {
        update_inventory(recipe_item, -recipe[recipe_item]);
    }
    update_inventory(item, 1);
    update_can_make();
}

$(function () {
    $.getJSON( "/base.json", function(items) {
        populate_item_table(items)
        inventory_table_inputs(items)
    })
});
