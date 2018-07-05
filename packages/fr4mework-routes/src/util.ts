export let globalStoreProperlyInitialized = (globalStore) => 
    !!globalStore.__fr4mework && !!globalStore.__fr4mework.location;

export let errorNoRouter = () =>
    console.error('You must wrap your app in a Router to get Route and Link working properly !');