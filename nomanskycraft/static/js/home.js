var Content = React.createClass({
    getInitialState: function() {
        return {focus: "Carbon", items: {}, inventory: {'Carbon': 20}}
    },
    componentDidMount: function() {
        this.loadBase()
    },
    loadBase: function() {
        $.getJSON('/base.json', function (data) {
            this.updateBase(data)
        }.bind(this))
    },
    updateBase: function(newItems) {
        var focus = this.state.focus;
        this.setState({items: newItems, focus: focus});
    },
    updateFocus: function(item) {
        var items = this.state.items;
        this.setState({items: items, focus: item});
    },
    updatePrice: function(item, price) {
        this.state.items[item].price = price
        this.updateBase(this.state.items);
    },
    render: function() {
        var info = this.state.items[this.state.focus];
        return (
            <div id='content'>
                <h1>No Man Sky Craft</h1>
                <Inventory items={this.state.items}inventory={this.state.inventory}/>
                <ItemInfo name={this.state.focus} info={info} onPriceChange={this.updatePrice.bind(null, this.state.focus)}/>
                <ItemSelectList items={this.state.items} onClickItem={this.updateFocus}/>
            </div>
       );
    }
});


var ItemInfo = React.createClass({
    getItemImagePath: function() {
        var base = '/images/items/200px-';
        return base + this.props.name.replace(/ /g, '-').toLowerCase() + '.png';
    },
    handlePriceChange: function(event) {
        this.props.onPriceChange(parseFloat(event.target.value));
    },
    render: function() {
        if (typeof this.props.info === "undefined") {
            return (<div></div>);
        }
        return(
            <div id='info'>
                <h4>{this.props.name}</h4>        
                <div>
                    <img src={this.getItemImagePath()}></img>
                </div>
                <div>
                    <span className='info'>Price</span>
                    <input onChange={this.handlePriceChange} type='number' step='0.001' value={this.props.info.price}></input>
                </div>
            </div>
        );
    }
});

var ItemSelectList = React.createClass({
    render: function() {
        var selectItems = Object.keys(this.props.items).map(function(name) {
            return <SelectItem name={name} key={this.props.items[name].ref} onClick={this.props.onClickItem.bind(null, name)}/>
        }.bind(this))
        return (
            <div id='quickadd'>
                <ul id='quickadd'>
                    {selectItems}
                </ul>
            </div>
       );
    }
})

var SelectItem = React.createClass({
    getItemImagePath: function() {
        var base = '/images/items/200px-';
        return base + this.props.name.replace(/ /g, '-').toLowerCase() + '.png';
    },
    render: function() {
        return (
            <li onClick={this.props.onClick}>
                <img src={this.getItemImagePath()}></img>
                <span>{this.props.name}</span>
            </li>
        );
    }
});

var Inventory = React.createClass({
    render: function() {
        var inventoryItems = Object.keys(this.props.inventory).map(function(name) {
            var q = this.props.inventory[name];
            var price;
            if (typeof this.props.items[name] === "undefined") {
                price = ""
            } else {
                price = this.props.items[name].price;
            }
            return <InventoryItem name={name} quantity={q} price={price} id={name} key={name}/>;
        }.bind(this));
        return (
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Quantity</td>
                            <td>Price</td>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryItems}
                    </tbody>
                </table>
               );
    }
});

var InventoryItem = React.createClass({
    render: function() {
        return (
                <tr>
                    <td className='name'>
                        {this.props.name} 
                    </td>
                    <td className='quantity'>
                        {this.props.quantity} 
                    </td>
                    <td className='price'>
                        {this.props.price} 
                    </td>
                </tr>
               );
    }
});

ReactDOM.render(
        <Content />,
        document.getElementById('content')
        );

