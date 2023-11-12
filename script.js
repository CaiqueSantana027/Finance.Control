const tbody = document.querySelector("tbody");
const descItem = document.querySelector("#Desc");
const amount = document.querySelector("#Valor");
const date = document.querySelector("#Date");
const type = document.querySelector("#type");
const btnNew = document.querySelector("#btnNew");
const btnGeneratePDF = document.getElementById('btnGeneratePDF');

const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

let items = [];

btnNew.onclick = () => {
  if (descItem.value === "" || amount.value === "" || date.value === "" || type.value === "") {
    return alert("Preencha todos os campos!");
  }

  items.push({
    desc: descItem.value,
    
   
amount: Math.abs(amount.value).toFixed(2),
    date: formatDate(date.value), // Alterando o formato da data
    type: type.value,
  });

  setItensBD();
  loadItens();

  clearFields();
};

function formatDate(rawDate) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(rawDate).toLocaleDateString('pt-BR', options);
}

function clearFields() {
  descItem.value = "";
  amount.value = "";
  date.value = "";
}

function deleteItem(index) {
  const isConfirmed = confirm("Tem certeza que deseja excluir este item?");

  if (isConfirmed) {
    items.splice(index, 1);
    setItensBD();
    loadItens();
  }
}

function insertItem(item, index) {
  let tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.desc}</td>
    <td>R$ ${item.amount}</td>
    <td>${item.date}</td> <!-- Adicionando a data -->
    <td class="columnType">${item.type === "Entrada"
      ? '<i class="bx bxs-chevron-up-circle"></i>'
      : '<i class="bx bxs-chevron-down-circle"></i>'
    }</td>
    <td class="columnAction">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;

  tbody.appendChild(tr);
}

function loadItens() {
  items = getItensBD();
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    insertItem(item, index);
  });

  getTotals();
}

function getTotals() {
  const amountIncomes = items
    .filter((item) => item.type === "Entrada")
    .map((transaction) => Number(transaction.amount));

  const amountExpenses = items
    .filter((item) => item.type === "Saída")
    .map((transaction) => Number(transaction.amount));

  const totalIncomes = amountIncomes
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);

  const totalExpenses = Math.abs(
    amountExpenses.reduce((acc, cur) => acc + cur, 0)
  ).toFixed(2);

  const totalItems = (totalIncomes - totalExpenses).toFixed(2);

  incomes.innerHTML = totalIncomes;
  expenses.innerHTML = totalExpenses;
  total.innerHTML = totalItems;
}

const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = () =>
  localStorage.setItem("db_items", JSON.stringify(items));

btnGeneratePDF.onclick = () => {
  generatePDF();
};

function generatePDF() {
  const jsPDF = new window.jspdf.jsPDF();

  const currentDate = new Date().toLocaleDateString();
  jsPDF.text('Relatório Financeiro - ' + currentDate, 20, 20);

  jsPDF.text('Detalhes da Movimentação:', 20, 40);
  items.forEach((item, index) => {
    jsPDF.text(`${index + 1}. Descrição: ${item.desc}, Valor: R$ ${item.amount}, Data: ${item.date}, Tipo: ${item.type}`, 20, 50 + index * 10);
  });

  jsPDF.text(`\nSaldos:`, 20, 60 + items.length * 10);
  jsPDF.text(`- Entrada: R$ ${incomes.innerHTML}`, 20, 80 + items.length * 10);
  jsPDF.text(`- Saída: R$ ${expenses.innerHTML}`, 20, 90 + items.length * 10);
  jsPDF.text(`- Total: R$ ${total.innerHTML}`, 20, 100 + items.length * 10);

  // Salva o PDF com o nome 'relatorio_financeiro.pdf' e força o download
  jsPDF.save('relatorio_financeiro.pdf');
}

loadItens();
