import Vue from 'vue';
import Vuex from 'vuex';
import ontology from './ontology';
import scatter from './scatter';

Vue.use(Vuex)

// That's vuex's need, sorry eslint
/* eslint-disable no-param-reassign */

export default new Vuex.Store({
  modules: {
    ontology,
    scatter,
  },
  getters: {
    currentUserInfo: (state, { currentUsername, currentBalance }) => ({
      name: currentUsername,
      balance: currentBalance,
    }),
    currentUsername: (state, { 'scatter/currentUsername': scatter, 'ontology/currentUsername': ontology }) => (
      scatter ? scatter : ( ontology ? ontology : null ) 
    ),
    currentBalance: (state, { 
      'scatter/currentUsername': scatterUsername,
      'ontology/currentUsername': ontologyUsername,
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance
    }) => (
      scatterUsername
      ? scatterBalance
      : ( ontologyUsername ? ontologyBalance : '... XXX' ) 
    ),
    isLogined: (state, { currentUserInfo }) => currentUserInfo.name !== null,
  },
  actions: {
    async walletConnectionSetup() {
    }
  },
});