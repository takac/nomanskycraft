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

function get_item_image_path(item) {
    var base = "/static/images/items/200px-";
    return base + item.replace(/ /g, "-").toLowerCase() + ".png";
}

function populate_item_table(items) {
    $.each(items, function(item) {
        var required_for = [];
        for (var i in items) {
            if ( items[i].hasOwnProperty('recipe') ) {
                if ( items[i]['recipe'].hasOwnProperty(item) ) {
                    required_for.push(i);
                }
            }
        }
        $("#items").find('tbody').append(
            $('<tr>').attr('id', item_to_link(item)).append(
                $('<td>').addClass('itemcolumn').append(
                    $("<img>").attr("src", get_item_image_path(item)),
                    $("<span>").text(item).addClass('name')),
                $('<td>').append(
                    $("<input>",
                        {type: "number", step:"0.01"})
                    .val(items[item].price)
                    .addClass('price')
                    .change(function() {
                        update_inventory(item, 0);
                        update_can_make();
                    })
                ),
                $('<td>')
                .addClass('recipe')
                .html(render_recipe(item, items[item].recipe || {}))
                .data("recipe", items[item].recipe), $('<td>').html(function() {
                    return required_for.map(function(i) {
                        return "<a href='#" + item_to_link(i) + "'>" + i + "</a>";
                    }).join(", ");
                })

            )
        )
    })
}

function item_to_link(item) {
    return item.replace(/ /g, "").toLowerCase();
}

function inventory_table_inputs(items) {
    var select = $("#inventoryitem")
    $.each(items, function(item) {
        select.append($("<option></option>")
                        .attr("value", item)
                        .text(item));
    });
	select.enterKey(add_item);
    $("#inventoryquantity").enterKey(add_item);
    $("#inventoryadd").click(add_item);

}
function add_item() {
	var item = $("#inventoryitem").val();
	var quant = $("#inventoryquantity").val();
	update_inventory(item, quant);
	update_can_make();
}

function update_inventory(item, quantity_change) {
    var tbody = $("#inventory tbody");
    var tr = tbody.find("tr:contains(" + item + ")");
    if (tr.length == 1) {
        var q = $(tr).find('.quantity');
        var price = $(tr).find('.price');
        var new_quant = parseInt(q.text()) + parseInt(quantity_change);
        price.text((get_price(item) * new_quant).toMoney());
        if (new_quant == 0) {
            tr.remove();
        } else {
            q.text(new_quant);
        }
    } else if (quantity_change > 0) {
        tbody.append(create_inventory_row(item, quantity_change, get_price(item)));
    }
    update_total()
}

function create_inventory_row(item, quantity, price) {
    return $('<tr>').append(
        $('<td>').addClass('noborder').append(
            $("<button>").addClass('remove')
            .click(function() {
                $(this).parents("tr").remove();
                update_can_make();
                update_total();
            }).html("&#10006;")
        ),
        $('<td>').append(
            $("<a>").attr('href', '#'+item_to_link(item)).addClass('name').text(item)
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

// Translate item table into object
function get_all_items() {
    var items = {};
    $("#items").find('tbody tr').each(function(idx, tr) {
        var tds = $(tr).find("td");
        var item = {"price": tds.find("input.price").val()};
        var recipe = tds.eq(2).text();
        if ( recipe !== "" ) {
            item["recipe"] = tds.eq(2).data('recipe')
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
    return parseFloat(items[item].price);
}

function update_total() {
    var total = 0;
    var inv = get_inventory();
    for (var item in inv) {
        total +=  get_price(item) * inv[item];
    }
    $("#total").text(total.toMoney());
}

// Translate inventory table to obj
function get_inventory() {
    var trs = $("#inventory").find('tbody tr');
    var inv = {};
    $.each(trs, function() {
        var tds = $(this).find("td");
        inv[tds.find(".name").text()] = parseInt($(tds.get(3)).text());
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

function render_recipe(item, recipe) {
    if (typeof recipe === "undefined") {
        recipe = get_recipe(item);
    }
    return Object.keys(recipe).map(function(i) {
        return "<span class='breakline'><a href='#" + item_to_link(i) + "'>" + i + "</a> x"+recipe[i]+"</span>";
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
        update_inventory(recipe_item, -recipe[recipe_item]);
    }
    update_inventory(item, 1);
    update_can_make();
}

// From http://stackoverflow.com/questions/979662/how-to-detect-pressing-enter-on-keyboard-using-jquery
$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

// From http://stackoverflow.com/a/2866613/1665365
/*
decimal_sep: character used as deciaml separtor, it defaults to '.' when omitted
thousands_sep: char used as thousands separator, it defaults to ',' when omitted
*/
Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep)
{
   var n = this,
   c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
   d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

   /*
   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
   the fastest way to check for not defined parameter is to use typeof value === 'undefined' 
   rather than doing value === undefined.
   */
   t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

   sign = (n < 0) ? '-' : '',

   //extracting the absolute value of the integer part of the number and converting to string
   i = parseInt(n = Math.abs(n).toFixed(c)) + '',

   j = ((j = i.length) > 3) ? j % 3 : 0;
   return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ''); 
}


$(function () {
    $.getJSON( "/base.json", function(items) {
        // $("#itemstable").toggle();
        populate_item_table(items)
        inventory_table_inputs(items)
        $("#inventoryitem").chosen();
        $("#toggleitems").click(function() { $("#itemstable").toggle() });
        update_inventory('Carbon', 250);
        update_inventory('Plutonium', 250);
        update_inventory('Iron', 250);
        update_can_make();
    })
});
