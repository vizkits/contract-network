/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

 /**
 * DeliverMaterial transaction
 * @param {org.acme.construction.DeliverMaterial} deliverMaterial
 * @transaction
 */
async function deliverMaterial(tx) {
    // update timestamp
    tx.material.deliverDateTime = tx.timestamp.toISOString();

    // update asset status
    tx.material.status = 'DELIVERED';

    // get asset registry
    const assetRegistry = await getAssetRegistry('org.acme.construction.BuildingMaterial');

    // update asset in asset registry
    await assetRegistry.update(tx.material);
}

 /**
 * InspectMaterial transaction
 * @param {org.acme.construction.InspectMaterial} inspectMaterial
 * @transaction
 */
async function inspectMaterial(tx) {
    // update timestamp
    tx.material.inspectDateTime = tx.timestamp.toISOString();

    // update asset info
    tx.material.inspector = tx.inspector;
    tx.material.status = tx.newStatus;
    const price = tx.material.price;
    tx.material.supplier.balance += tx.newStatus == 'INSPECTED'? price : 0;

    // get asset registry
    const materialRegistry = await getAssetRegistry('org.acme.construction.BuildingMaterial');

    // update asset in asset registry
    await materialRegistry.update(tx.material);

    // transfer fund after inspected
    if (tx.newStatus == 'INSPECTED') {
        const fundRegistry = await getAssetRegistry('org.acme.construction.ConstructionFund');
        const funds = await fundRegistry.getAll();
        
        // assume just one fund for now
        var fund = funds[0];
        fund.balance -= price;
        await fundRegistry.update(fund);
    }
}

/**
 * FinishWork transaction
 * @param {org.acme.construction.FinishWork} finishWork
 * @transaction
 */
async function finishWork(tx) {
    // update timestamp
    tx.work.finishDateTime = tx.timestamp.toISOString();

    // update asset status
    tx.work.status = 'COMPLETED';

    // get asset registry
    const assetRegistry = await getAssetRegistry('org.acme.construction.ConstructionWork');

    // update asset in asset registry
    await assetRegistry.update(tx.work);
}

/**
 * InspectWork transaction
 * @param {org.acme.construction.InspectWork} inspectWork
 * @transaction
 */
async function inspectWork(tx) {
    // update timestamp
    tx.work.finishDateTime = tx.timestamp.toISOString();

    // update asset info
    tx.work.inspector = tx.inspector;
    tx.work.status = tx.newStatus;
    const cost = tx.work.cost;
    tx.work.builder.balance += tx.newStatus == 'INSPECTED'? cost : 0;

    // get asset registry
    const assetRegistry = await getAssetRegistry('org.acme.construction.ConstructionWork');

    // update asset in asset registry
    await assetRegistry.update(tx.work);
    
    // transfer fund after inspected
    if (tx.newStatus == 'INSPECTED') {
        const fundRegistry = await getAssetRegistry('org.acme.construction.ConstructionFund');
        const funds = await fundRegistry.getAll();

        // assume just one fund for now
        var fund = funds[0];
        fund.balance -= cost;
        await fundRegistry.update(fund);
    }
}

/**
 * ProcessRCO transaction
 * @param {org.acme.construction.ProcessRCO} processRCO
 * @transaction
 */
async function processRCO(tx) {
    // create an OCO
    const factory = getFactory();
    const oco = factory.newTransaction('org.acme.construction', 'OwnerChangeOrder');
    oco.approveAmount = tx.approveAmount;
    oco.approveDateTime = tx.timestamp.toISOString();
    oco.from = factory.newRelationship('org.acme.construction', 'Owner', tx.approver.getIdentifier());
    oco.to = factory.newRelationship('org.acme.construction', 'GeneralContractor', tx.rco.from.getIdentifier());
    oco.status = tx.status;

    // add oco to asset registry
    const ocoAssetRegistry = await getAssetRegistry('org.acme.construction.OwnerChangeOrder');
    await ocoAssetRegistry.add(oco);

    // transfer to fund after approved
    if (tx.status == 'APPROVED') {
        const fundRegistry = await getAssetRegistry('org.acme.construction.ConstructionFund');
        const funds = await fundRegistry.getAll();

        // assume just one fund for now
        var fund = funds[0];
        fund.balance += tx.approveAmount;
        await fundRegistry.update(fund);
    }
}