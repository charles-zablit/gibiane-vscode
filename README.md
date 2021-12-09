# Gibiane pour VSCode

![Version](https://vsmarketplacebadge.apphb.com/version/CharlesZablit.gibiane-vscode.svg) ![Installs](https://vsmarketplacebadge.apphb.com/installs-short/CharlesZablit.gibiane-vscode.svg) ![Last commit](https://img.shields.io/github/last-commit/charles-zablit/gibiane-vscode) ![Open issues](https://img.shields.io/github/issues/charles-zablit/gibiane-vscode) ![Closed issues](https://img.shields.io/github/issues-closed/charles-zablit/gibiane-vscode) ![Size](https://img.shields.io/github/repo-size/charles-zablit/gibiane-vscode) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/charles-zablit/gibiane-vscode/Deploy%20Extension)

![Example Syntax](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/example-1.png)

## Description

Cette extension pour [Visual Studio Code](https://code.visualstudio.com/) ajoute plusieurs fonctionnalités pour le language Gibiane, utilisé notamment par le logiciel [Cast3M](http://www-cast3m.cea.fr/).

### Fonctionnalités

- Executer les scripts Gibiane depuis un bouton dans l'éditeur (lire la partie [configuration](#configuration))
- _Syntax highlighting_ (cf image ci-dessus).
- _Go-To-Defintion_, un ctrl+click sur une variable ramène à sa définition.
- _Autocompletion_, la suggestion de procédures et des noms de variables déjà déclarées, comme sur la photo ci-dessous.
- _Hover_, passer votre souris sur une variable ou une fonction pour avoir un aperçu de sa définition et la documentation associée.
- _Rename_, possibilité de renommer une variable d'un seul click.
- _Code outline_, permet de voir la structure du code.

![Example AutoCompletion](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/example-2.png)

![Example Rename](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/example-3.png)

![Example Outline](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/example-4.png)

![Example Hover](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/example-5.png)

## Utilisation

- Pour lancer un script Gibiane (avec Cast3M par exemple), ouvrez un fichier .dgibi dans l'éditeur et cliquez sur le bouton vert en haut à droite de l'éditeur.
- Pour utiliser les suggestions intelligentes, déclarez une variable, puis commencez à taper son nom. Une suggestion devrait apparaître. Appuyez sur la touche TABULATION pour l'insérer.
- Pour revenir à la définition d'une variable, maintenez la touche CTRL (CMD sur Mac) enfoncée et cliquez sur la variable.
- Pour avoir un simple aperçu de la définition d'une variable, il suffit de passer votre souris dessus.

_N.B_: Si vous préférez avoir plus de contrôle sur l'exécution de votre script, vous pouvez utiliser un fichier tasks.json pour VSCode. Vous pouvez trouvez un exemple [ici](https://gist.github.com/charles-zablit/c39664fcc3c423004d9aca8a3cb3959f) avec des explications sur son fonctionnement et son installation.

## Installation

1.  Installez Visual Studio Code pour votre platforme depuis [ce lien](https://code.visualstudio.com/).
2.  Une fois dans l'IDE, cliquez sur l'icon ci-dessous (1).
    ![Installation](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/installation.png)
3.  Tapez "Gibiane" dans la barre de recherche (2) et sélectionnez le premier résultat (3).
4.  Cliquez sur le boutton "Installer" (4).
5.  Vous pouvez maintenant ouvrir votre fichier `.dgibi`.

## Configuration

La configuration se fait dans le menu _Settings_ de VSCode.

\***\*Elle n'est à faire que si le bouton d'exécution des scripts ne fonctionne pas.** \*\*

Cliquez sur la roue dentée (1), puis sur settings (2), puis dans la barre de recherche (3) tapez Gibiane. Dans le champs `Gibiane-vscode:Commande` (4), rentrez le nom de la commande avec laquelle vous executez votre script habituellement. Par exemple, si vous utilisez `castem20 /home/me/script.dgibi`, rentrez `castem20` uniquement.
![Configuration](https://raw.githubusercontent.com/charles-zablit/gibiane-vscode/master/images/configuration-1.png)
