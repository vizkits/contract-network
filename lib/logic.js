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
    tx.material.deliverDateTime = tx.timestamp.toISOString(); //Date().toString();

    // update the asset status
    tx.material.status = DELIVERED;

    // get the asset registry for the asset
    const assetRegistry = await getAssetRegistry('org.acme.construction.BuildingMaterial');

    // update the asset in the asset registry
    await assetRegistry.update(tx.material);
}

 /**
 * InspectMaterial transaction
 * @param {org.acme.construction.InspectMaterial} inspectMaterial
 * @transaction
 */
async function inspectMaterial(tx) {
    // update timestamp
    tx.material.inspectDateTime = tx.timestamp.toISOString(); //Date().toString();

    // update the asset status
    tx.material.status = INSPECTED;

    // transfer fund
    const fundRegistry = await getAssetRegistry('org.acme.construction.Fund');
    const funds = await fundRegistry.getAll();
    var fund = funds[0]; // assume just one for now
    fund.balance -= tx.material.cost;
    tx.material.owner.balance +=  tx.material.cost;
    await fundRegistry.update(fund);
    
    // get the asset registry for the asset
    const materialRegistry = await getAssetRegistry('org.acme.construction.BuildingMaterial');

    // update the asset in the asset registry
    await materialRegistry.update(tx.material);
}

/**
 * FinishWork transaction
 * @param {org.acme.construction.FinishWork} finishWork
 * @transaction
 */
async function finishWork(tx) {
    // update timestamp
    tx.work.finishDateTime = tx.timestamp.toISOString(); //Date().toString();

    // update the asset status
    tx.work.status = COMPLETED;

    // get the asset registry for the asset
    const assetRegistry = await getAssetRegistry('org.acme.construction.Work');

    // update the asset in the asset registry
    await assetRegistry.update(tx.work);
}

/**
 * InspectWork transaction
 * @param {org.acme.construction.InspectWork} inspectWork
 * @transaction
 */
async function inspectWork(tx) {
    // update timestamp
    tx.work.finishDateTime = tx.timestamp.toISOString(); //Date().toString();

    // update the asset status
    tx.work.status = INSPECTED;

    // transfer fund
    const fundRegistry = await getAssetRegistry('org.acme.construction.Fund');
    const funds = await fundRegistry.getAll();
    var fund = funds[0]; // assume just one for now
    fund.balance -= tx.work.cost;
    tx.work.owner.balance +=  tx.work.cost;
    await fundRegistry.update(fund);

    // get the asset registry for the asset
    const assetRegistry = await getAssetRegistry('org.acme.construction.Work');

    // update the asset in the asset registry
    await assetRegistry.update(tx.work);
}
