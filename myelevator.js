/*
 * Available information:
 * 1. Request queue
 * Simulator.get_instance().get_requests()
 * Array of integers representing floors where there are people calling the elevator
 * eg: [7,3,2] // There are 3 people waiting for the elevator at floor 7,3, and 2, in that order
 * 
 * 2. Elevator object
 * To get all elevators, Simulator.get_instance().get_building().get_elevator_system().get_elevators()
 * Array of Elevator objects.
 * - Current floor
 * elevator.at_floor()
 * Returns undefined if it is moving and returns the floor if it is waiting.
 * - Destination floor
 * elevator.get_destination_floor()
 * The floor the elevator is moving toward.
 * - Position
 * elevator.get_position()
 * Position of the elevator in y-axis. Not necessarily an integer.
 * - Elevator people
 * elevator.get_people()
 * Array of people inside the elevator
 * 
 * 3. Person object
 * - Floor
 * person.get_floor()
 * - Destination
 * person.get_destination_floor()
 * - Get time waiting for an elevator
 * person.get_wait_time_out_elevator()
 * - Get time waiting in an elevator
 * person.get_wait_time_in_elevator()
 * 
 * 4. Time counter
 * Simulator.get_instance().get_time_counter()
 * An integer increasing by 1 on every simulation iteration
 * 
 * 5. Building
 * Simulator.get_instance().get_building()
 * - Number of floors
 * building.get_num_floors()
 */

 Array.prototype.min = function(comparer) {

    if (this.length === 0) return null;
    if (this.length === 1) return this[0];

    comparer = (comparer || Math.min);

    var v = this[0];
    for (var i = 1; i < this.length; i++) {
        v = comparer(this[i], v);    
    }

    return v;
}

function sortArray(reversed){
    return function(){
        reversed = !reversed;
        return function(a,b){
            return (a==b ? 0 : a < b? -1 : 1) * (reversed ? -1 : 1);
        };
    };
};

var sortAsc = sortArray();
var sortDesc = sortArray(true);

/*
 * This simple modification is using a basic flow as:
 * (a) Fetching any available requests if the elevator is empty
 * (b) Otherwise, proceed moving passengers per their destinations
 * Upon departing, it will firstly sort the destinations based on the direction
 * Moving up means that the destinations are sorted ascendingly, and vice versa
 */

Elevator.prototype.decide = function() {
    var simulator = Simulator.get_instance();
    var requests = simulator.get_requests();
    var people = this.get_people();
    var elevator = this;

    if( people.length < 1 ) {
        if( requests.length < 1 ) return;
        var floorToFetch = requests.shift();
        //console.log( elevator.id + ' is going to fetch on floor #' + floorToFetch)
        return elevator.commit_decision( floorToFetch );
    } else {
        var destinations = [], closestDestination, sortCompare;
        people.forEach( function(person){
            destinations.push( person.destination_floor );
        } );

        closestDestination = destinations.min();
        sortCompare = closestDestination > elevator.at_floor();

        destinations = destinations.sort( sortAsc() );
        if( sortCompare ) destinations = destinations.sort( sortDesc() );

        for( var i = 0; i < destinations.length; i++ ){
            var floorToTake = destinations[i];
            //console.log( elevator.id + ' is taking passenger to floor #' + floorToTake )
            return elevator.commit_decision( floorToTake );
        }
    }
};
