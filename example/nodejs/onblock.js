export default async function (robonomics) {
  const unsubscribe = await robonomics.events.onBlock((number) => {
    console.log(`Block: ${number}`);
  });
  return unsubscribe;
}
