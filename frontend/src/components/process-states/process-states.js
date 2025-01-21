import React, { useState } from 'react';

const processStates = () => {


    const handleLogin = async (event) => {

    };
    function M() {
        const  name = "M";
        if (name) {
            return <h1>Hello {name}</h1>;
        }
        return <h1>Hello World</h1>;
    }

    return (
        <div>
            <p1>

            </p1>

        </div>



    //     import React from 'react';
        //
        // const ProcessState = ({ getOrdersIds, getPizzasInOrder, getNumberOfPizzasInOrder, onProductionOrderClick, onProductionPizzaClick, UuidUtil, getToppingsForPizzaName, capitalizeFirstLetter }) => {
        //     return (
        //         <div>
        //             <table className="table table-sm table-light table-borderless table-bordered">
        //                 <thead>
        //                     <tr className="unselectable">
        //                         <th className="table-title" style={{ width: '8%' }}>Order</th>
        //                         <th className="table-title" style={{ width: '8%' }}>Pizza</th>
        //                         <th className="table-title" style={{ width: '15%' }}>Started</th>
        //                         <th className="table-title" style={{ width: '15%' }}>Finished</th>
        //                         <th className="table-title" style={{ width: '10%' }}>Dough</th>
        //                         <th className="table-title" style={{ width: '15%' }}>Pizza Name</th>
        //                         <th className="table-title" style={{ width: '7%' }}>State</th>
        //                         <th className="table-title" style={{ width: '20%' }}>Status</th>
        //                     </tr>
        //                 </thead>
        //                 <tbody>
        //                     {getOrdersIds().map((orderId) => (
        //                         getPizzasInOrder(orderId).map((pizza, rowIndex) => (
        //                             <tr key={`${orderId}-${pizza.uuid}`}>
        //                                 {rowIndex === 0 && (
        //                                     <td
        //                                         className="table-cell order-column"
        //                                         rowSpan={getNumberOfPizzasInOrder(orderId)}
        //                                     >
        //                                         <button
        //                                             type="button"
        //                                             className="btn btn-outline-primary btn-sm ms-0 me-0"
        //                                             style={{ width: '94%', marginTop: '2px', marginBottom: '2px' }}
        //                                             onClick={() => onProductionOrderClick(orderId)}
        //                                         >
        //                                             {UuidUtil.shortenUUID(orderId)}
        //                                         </button>
        //                                     </td>
        //                                 )}
        //                                 <td className="table-cell p-0">
        //                                     <button
        //                                         type="button"
        //                                         className="btn btn-outline-primary btn-sm ms-0 me-0"
        //                                         style={{ width: '94%', marginTop: '2px', marginBottom: '2px' }}
        //                                         onClick={() => onProductionPizzaClick(pizza, 'modelButtonPizzaInfoFinished')}
        //                                     >
        //                                         {UuidUtil.shortenUUID(pizza.uuid)}
        //                                     </button>
        //                                 </td>
        //                                 <td className="table-cell">{new Date(pizza.startTime).toLocaleString()}</td>
        //                                 <td className="table-cell">{new Date(pizza.updateTime).toLocaleString()}</td>
        //                                 <td className="table-cell">{pizza.doughType}</td>
        //                                 <td className="table-cell-toppings-profile">
        //                                     {getToppingsForPizzaName(pizza, false, false)}
        //                                 </td>
        //                                 <td className="table-cell p-0">
        //                                     {pizza.status === 'delivery' && (
        //                                         <span className="badge rounded-pill bg-info table-cell-status">
        //                                             {capitalizeFirstLetter(pizza.status)}
        //                                         </span>
        //                                     )}
        //                                     {pizza.status === 'success' && (
        //                                         <span className="badge rounded-pill bg-success table-cell-status">
        //                                             {capitalizeFirstLetter(pizza.status)}
        //                                         </span>
        //                                     )}
        //                                     {pizza.status === 'failed' && (
        //                                         <span className="badge rounded-pill bg-danger table-cell-status">
        //                                             {capitalizeFirstLetter(pizza.status)}
        //                                         </span>
        //                                     )}
        //                                 </td>
        //                                 <td className="table-cell">{pizza.finishStatus}</td>
        //                             </tr>
        //                         ))
        //                     ))}
        //                 </tbody>
        //             </table>
        //         </div>
        //     );
        // };
        //
        // export default ProcessState;
    );
};

export default processStates;