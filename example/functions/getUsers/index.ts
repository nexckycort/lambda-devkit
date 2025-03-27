export const handler = async (event: any) => {
  console.log('Event:', event);

  return {
    statusCode: 200,
    body: JSON.stringify([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]),
  };
};
