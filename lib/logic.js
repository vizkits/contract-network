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
    tx.material.deliverDateTime = Date().toString();

    // update the asset with the new value
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
    tx.material.inspectDateTime = Date().toString();

    // update the asset with the new value
    tx.material.status = INSPECTED;

    // get the asset registry for the asset
    const assetRegistry = await getAssetRegistry('org.acme.construction.BuildingMaterial');

    // update the asset in the asset registry
    await assetRegistry.update(tx.material);
}