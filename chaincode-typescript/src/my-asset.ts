/*
 * SPDX-License-Identifier: 
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class MyAsset {

    @Property()
    public value: string;

}
