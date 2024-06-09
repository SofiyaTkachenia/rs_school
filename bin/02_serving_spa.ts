#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {ServingSpaStack} from "../lib/02_serving_spa-stack";

const app = new cdk.App();

new ServingSpaStack(app, 'serving-spa-stack');
