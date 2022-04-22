# chemin a mettre a jour 
# CASTEM_REP="/opt/CASTEM2021/"
CASTEM_REP="/home/bp/CAST3M/version_du_jour/castem_workdir/SOURCES/castem/"


# MAJ de OPERATEURS_NAME
# ======================

# sauvegarde prealable
if [ -f OPERATEURS_NAME ]; then 
  today=`date +%F -r OPERATEURS_NAME` 
  mv OPERATEURS_NAME OPERATEURS_NAME-$today.save
fi;

# recup de pilot.eso
if [ -f ${CASTEM_REP}/sources/pilot.eso ]; then
  cp -p ${CASTEM_REP}/sources/pilot.eso . ;
else
  echo "Merci de fournir un chemin valide pour \${CASTEM_REP}"; 
  exit 1; 
fi


# on essaie d'automatiser le travail
# on met tous les noms du tableau MDIR dans le fichier OPERATEURS_NAME
# on commence par recuperer ces noms (le dernier de la liste est l'operateur PROL)
ideb=`grep -in "DATA MDIR1" pilot.eso | cut -d : -f 1`
ifin=`grep -in -m 1 "PROL" pilot.eso | cut -d : -f 1`
ilong=`expr $ifin - $ideb`
ilong=`expr $ilong + 1`
rm -f toto OPERATEURS_NAME
head -$ifin pilot.eso | tail -$ilong > toto
# remplace les virgules par retours a la ligne
sed -i 's/,/\n/g' toto 
cat toto | cut -d \' -f 2 >  OPERATEURS_NAME
# on supprime les .... et autres merdouilles
sed -i '/^$/d' OPERATEURS_NAME
sed -ri '/\.{4}/d' OPERATEURS_NAME
sed -ri '/     >/d' OPERATEURS_NAME
# on supprime aussi certains operateurs (arithmetique, comparaison, boucle et tests) 
# qui seront traites a part
sed -ri '/\+/d' OPERATEURS_NAME
sed -ri '/\-/d' OPERATEURS_NAME
sed -ri '/\*\*/d' OPERATEURS_NAME
sed -ri '/\*/d' OPERATEURS_NAME
sed -ri '/\//d' OPERATEURS_NAME
sed -ri '/>EG /d' OPERATEURS_NAME
sed -ri '/<EG /d' OPERATEURS_NAME
sed -ri '/>/d' OPERATEURS_NAME
sed -ri '/</d' OPERATEURS_NAME
sed -ri '/REPE/d' OPERATEURS_NAME
sed -ri '/ITER/d' OPERATEURS_NAME
sed -ri '/QUIT/d' OPERATEURS_NAME
sed -ri '/FIN/d' OPERATEURS_NAME
sed -ri '/SI  /d' OPERATEURS_NAME
sed -ri '/SINO/d' OPERATEURS_NAME
sed -ri '/FINS/d' OPERATEURS_NAME
sed -ri '/DEBP/d' OPERATEURS_NAME
sed -ri '/FINP/d' OPERATEURS_NAME
sed -ri '/ET  /d' OPERATEURS_NAME
sed -ri '/OU  /d' OPERATEURS_NAME
sed -ri '/EGA /d' OPERATEURS_NAME
sed -ri '/NON /d' OPERATEURS_NAME
sed -ri '/NEG /d' OPERATEURS_NAME

# finalisation : on met eventuellement des | au lieu des \n
tr '\n' '|' < OPERATEURS_NAME > toto
# mv toto OPERATEURS_NAME
# suppression des whitespace
tr -d '[:blank:]' < toto > OPERATEURS_NAME

# MAJ de PROCEDURES_NAME
# ======================

# sauvegarde prealable
if [ -f PROCEDURES_NAME ]; then 
  today=`date +%F -r PROCEDURES_NAME` 
  mv PROCEDURES_NAME PROCEDURES_NAME-$today.save
fi;

touch PROCEDURES_NAME
for i in `ls ${CASTEM_REP}/procedur/*.procedur`; do   
  j1=$(basename $i); 
  j=${j1%.*};  
  echo $j | tr '[:lower:]' '[:upper:]' >> PROCEDURES_NAME 
done      
# # ajout de qq procedures perso
# # echo "BRASERO"  >> PROCEDURES_NAME  
# # echo "GERBOISE" >> PROCEDURES_NAME  
# echo "PANDA"    >> PROCEDURES_NAME  

# finalisation : on met eventuellement des | au lieu des \n
tr '\n' '|' < PROCEDURES_NAME > toto
mv toto PROCEDURES_NAME

echo "il vous reste à copier-coller OPERATEURS_NAME et PROCEDURES_NAME"
echo "dans les listes du fichier gibiane.tmLanguage.json"

